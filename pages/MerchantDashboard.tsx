import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge, Alert, ImageUploader, Textarea, Icons } from '../components/ui';
import * as API from '../services/api';
import { Product, Order, Attraction } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export const MerchantDashboard = () => {
  const { user } = useAuth();
  const { notify, confirm } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState<Partial<Product>>({ name: '', price: 0, stock: 1, description: '', attractionId: '' });
  const [newItemImages, setNewItemImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && user.status === 'active') {
      API.getProducts({ merchantId: user.id }).then(res => res.data && setProducts(res.data));
      API.getOrders(undefined, user.id).then(res => res.data && setOrders(res.data));
      API.getAttractions({}).then(res => res.data && setAttractions(res.data));
    }
  }, [user]);

  if (!user) return null;

  if (user.status === 'pending') {
      return (
          <Card className="p-12 text-center max-w-2xl mx-auto mt-10">
              <div className="text-yellow-500 mb-4 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Account Pending Approval</h1>
              <p className="text-gray-600 mb-6">Your merchant application is under review. Please check back later.</p>
              <Button onClick={() => window.location.reload()} variant="secondary">Check Status</Button>
          </Card>
      );
  }

  const handleSaveProduct = async () => {
    if (!newItem.name || !newItem.price) {
        notify("Name and Price are required", "error");
        return;
    }
    setUploading(true);
    const payload = { ...newItem, merchantId: user.id, merchantName: user.username, imageUrls: newItemImages };
    if (editingId) {
        const res = await API.updateProduct(editingId, payload);
        if (res.success && res.data) {
            setProducts(products.map(p => p.id === editingId ? res.data! : p));
            setIsFormOpen(false);
            setEditingId(null);
            notify("Product updated", "success");
        }
    } else {
        const res = await API.createProduct(payload);
        if (res.success && res.data) {
          setProducts([...products, res.data]);
          setIsFormOpen(false);
          notify("Product added", "success");
        }
    }
    setUploading(false);
  };

  const handleShipOrder = async (orderId: string) => {
      const tracking = trackingInputs[orderId];
      if (!tracking) {
          notify("Please enter tracking number", "error");
          return;
      }
      const res = await API.updateOrderStatus(orderId, 'shipped', tracking);
      if (res.success) {
          setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'shipped', trackingNumber: tracking } : o));
          notify("Order shipped!", "success");
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Store Dashboard</h1>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
            {isFormOpen ? 'Cancel' : 'Add New Product'}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="p-6 bg-blue-50 border-blue-100 animate-fade-in-down">
           <h3 className="font-bold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input label="Name *" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
             <Input label="Price *" type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} />
             <Input label="Stock *" type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})} />
             <div className="md:col-span-2">
               <ImageUploader images={newItemImages} onChange={setNewItemImages} label="Product Images" />
             </div>
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">Associated Attraction</label>
               <select className="w-full border border-gray-300 rounded px-3 py-2" value={newItem.attractionId} onChange={e => setNewItem({...newItem, attractionId: e.target.value})}>
                 <option value="">None</option>
                 {attractions.map(attr => <option key={attr.id} value={attr.id}>{attr.title}</option>)}
               </select>
             </div>
             <div className="md:col-span-2">
                <Textarea label="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
             </div>
           </div>
           <Button className="mt-4" onClick={handleSaveProduct} isLoading={uploading}>Save Product</Button>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Your Products</h2>
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex justify-between p-3 bg-white border rounded shadow-sm">
                <div className="flex gap-3">
                  <img src={p.imageUrl} alt="p" className="w-12 h-12 rounded object-cover" />
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">${p.price} | Stock: {p.stock}</div>
                  </div>
                </div>
                <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => { setEditingId(p.id); setNewItem(p); setNewItemImages(p.imageUrls || []); setIsFormOpen(true); }}>Edit</Button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {orders.map(o => (
              <Card key={o.id} className="p-4 bg-white border rounded shadow-sm">
                <div className="flex justify-between mb-3 border-b pb-2">
                   <div>
                       <span className="font-bold text-blue-600 block">{o.id}</span>
                       <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</span>
                   </div>
                   <Badge color={o.status === 'shipped' ? 'blue' : 'yellow'}>{o.status}</Badge>
                </div>
                
                <div className="mb-4 bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        <Icons.User />
                        <span>Recipient: {o.realName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span>Phone: {o.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                        <Icons.MapPin />
                        <p className="flex-grow">{o.address}</p>
                    </div>
                </div>

                <div className="text-sm text-gray-600 mb-3 space-y-1 bg-gray-50 p-2 rounded">
                    {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t pt-1 mt-1 font-bold text-right">Total: ${o.total.toFixed(2)}</div>
                </div>

                {o.status === 'pending' && (
                    <div className="flex gap-2 items-end mt-4">
                        <div className="flex-grow">
                            <Input 
                                label="Tracking Number" 
                                placeholder="Enter tracking #" 
                                className="mb-0 text-sm"
                                value={trackingInputs[o.id] || ''}
                                onChange={(e) => setTrackingInputs({...trackingInputs, [o.id]: e.target.value})}
                            />
                        </div>
                        <Button onClick={() => handleShipOrder(o.id)} className="py-2">Ship</Button>
                    </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};