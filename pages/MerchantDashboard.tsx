import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge, Alert, ImageUploader, Textarea } from '../components/ui';
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
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New/Edit Product Form State
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
              <p className="text-gray-600 mb-6">Your merchant application has been submitted and is currently under review by our administrators. Please check back later.</p>
              <Button onClick={() => window.location.reload()} variant="secondary">Check Status Again</Button>
          </Card>
      );
  }

  if (user.status === 'rejected') {
      return (
          <Alert type="error">
              <h3 className="font-bold">Application Rejected</h3>
              <p>Your merchant application was not approved. Please contact support for more details.</p>
          </Alert>
      );
  }

  const openAddForm = () => {
    setEditingId(null);
    setNewItem({ name: '', price: 0, stock: 1, description: '', attractionId: '' });
    setNewItemImages([]);
    setIsFormOpen(true);
  };

  const openEditForm = (p: Product) => {
    setEditingId(p.id);
    setNewItem({
        name: p.name,
        price: p.price,
        stock: p.stock,
        description: p.description,
        attractionId: p.attractionId || ''
    });
    setNewItemImages(p.imageUrls || (p.imageUrl ? [p.imageUrl] : []));
    setIsFormOpen(true);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = async () => {
    if (!newItem.name || !newItem.price) {
        notify("Name and Price are required", "error");
        return;
    }
    setUploading(true);
    
    const payload = { 
        ...newItem, 
        merchantId: user.id, 
        merchantName: user.username,
        imageUrls: newItemImages
    };
    
    if (editingId) {
        // Update existing
        const res = await API.updateProduct(editingId, payload);
        if (res.success && res.data) {
            setProducts(products.map(p => p.id === editingId ? res.data! : p));
            setIsFormOpen(false);
            setEditingId(null);
            notify("Product updated successfully", "success");
            setNewItem({ name: '', price: 0, stock: 1, description: '', attractionId: '' });
            setNewItemImages([]);
        }
    } else {
        // Create new
        const res = await API.createProduct(payload);
        if (res.success && res.data) {
          setProducts([...products, res.data]);
          setIsFormOpen(false);
          setNewItem({ name: '', price: 0, stock: 1, description: '', attractionId: '' });
          setNewItemImages([]);
          notify("Product added successfully", "success");
        }
    }
    setUploading(false);
  };

  const handleDeleteProduct = (id: string) => {
      confirm("Are you sure you want to delete this product? This cannot be undone.", async () => {
          const res = await API.deleteProduct(id);
          if (res.success) {
              setProducts(products.filter(p => p.id !== id));
              notify("Product deleted successfully", "success");
              if (editingId === id) {
                  setIsFormOpen(false);
                  setEditingId(null);
              }
          }
      });
  };

  const handleShipOrder = async (orderId: string) => {
      const tracking = trackingInputs[orderId];
      if (!tracking) {
          notify("Please enter a tracking number.", "error");
          return;
      }
      
      const res = await API.updateOrderStatus(orderId, 'shipped', tracking);
      if (res.success) {
          setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'shipped', trackingNumber: tracking } : o));
          notify("Order marked as shipped!", "success");
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Store Dashboard</h1>
        <Button onClick={isFormOpen ? () => setIsFormOpen(false) : openAddForm}>
            {isFormOpen ? 'Cancel' : 'Add New Product'}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="p-6 bg-blue-50 border-blue-100">
           <h3 className="font-bold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input label="Name *" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
             <Input label="Price *" type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} />
             <Input label="Stock *" type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})} />
             <div className="md:col-span-2">
               <ImageUploader 
                 images={newItemImages}
                 onChange={setNewItemImages}
                 label="Product Images"
               />
             </div>
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">Associated Attraction (Optional)</label>
               <select 
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={newItem.attractionId || ''} 
                  onChange={e => setNewItem({...newItem, attractionId: e.target.value})}
               >
                 <option value="">None (General Product)</option>
                 {attractions.map(attr => (
                   <option key={attr.id} value={attr.id}>{attr.title}</option>
                 ))}
               </select>
               <p className="text-xs text-gray-500 mt-1">If selected, this product will appear on the attraction's detail page.</p>
             </div>
             <div className="md:col-span-2">
                <Textarea label="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
             </div>
           </div>
           <Button className="mt-4" onClick={handleSaveProduct} isLoading={uploading} disabled={uploading}>
               {editingId ? 'Save Changes' : 'Create Product'}
           </Button>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Your Products</h2>
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex justify-between p-3 bg-white border rounded shadow-sm">
                <div className="flex gap-3">
                  <img src={p.imageUrl} alt="product" className="w-12 h-12 rounded object-cover" />
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">Stock: {p.stock} | ${p.price}</div>
                    {p.attractionName && <span className="text-xs text-gray-500 block mt-1">📍 {p.attractionName}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                        <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => openEditForm(p)}>Edit</Button>
                        <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleDeleteProduct(p.id)}>Delete</Button>
                    </div>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-gray-500">No products yet.</p>}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {orders.map(o => (
              <Card key={o.id} className="p-4 bg-white border rounded shadow-sm">
                <div className="flex justify-between mb-3">
                   <div>
                       <span className="font-medium text-sm block">Order #{o.id.slice(-6)}</span>
                       <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                   </div>
                   <Badge color={o.status === 'delivered' ? 'green' : o.status === 'shipped' ? 'blue' : 'yellow'}>{o.status}</Badge>
                </div>
                
                <div className="text-sm text-gray-600 mb-3 space-y-1 bg-gray-50 p-2 rounded">
                    {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t border-gray-200 pt-1 mt-1 font-bold text-right">
                        Total: ${o.total.toFixed(2)}
                    </div>
                </div>

                {o.status === 'pending' && (
                    <div className="flex gap-2 items-end">
                        <div className="flex-grow">
                            <label className="text-xs text-gray-500 mb-1 block">Tracking Number</label>
                            <input 
                                className="w-full text-sm border rounded px-2 py-1"
                                placeholder="Enter tracking #"
                                value={trackingInputs[o.id] || ''}
                                onChange={(e) => setTrackingInputs({...trackingInputs, [o.id]: e.target.value})}
                            />
                        </div>
                        <Button onClick={() => handleShipOrder(o.id)} className="py-1 text-sm h-8">Ship</Button>
                    </div>
                )}
                {o.status === 'shipped' && (
                    <div className="text-sm text-blue-600">
                        Tracking: <span className="font-mono bg-blue-50 px-1 rounded">{o.trackingNumber}</span>
                    </div>
                )}
              </Card>
            ))}
             {orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};