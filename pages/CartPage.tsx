import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Icons, Input, Textarea } from '../components/ui';
import * as API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';

const ShippingDetailsModal = ({ 
    isOpen, 
    onClose, 
    onSave,
    initialData 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onSave: (data: {address: string, phone: string, realName: string}) => void,
    initialData: {address?: string, phone?: string, realName?: string}
}) => {
    const [formData, setFormData] = useState({
        address: initialData.address || '',
        phone: initialData.phone || '',
        realName: initialData.realName || ''
    });
    
    useEffect(() => {
        setFormData({
            address: initialData.address || '',
            phone: initialData.phone || '',
            realName: initialData.realName || ''
        });
    }, [initialData]);

    if (!isOpen) return null;

    const isValid = formData.address.trim() && formData.phone.trim() && formData.realName.trim();

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <Card className="max-w-md w-full mx-4 p-6 shadow-2xl animate-fade-in-down">
                <h3 className="text-xl font-bold mb-4">Complete Shipping Info</h3>
                <p className="text-sm text-gray-600 mb-6">Please provide your contact and delivery details to complete the order.</p>
                
                <div className="space-y-4">
                    <Input 
                        label="Full Name *" 
                        placeholder="Receiver's name"
                        value={formData.realName}
                        onChange={(e) => setFormData({...formData, realName: e.target.value})}
                    />
                    <Input 
                        label="Phone Number *" 
                        placeholder="Contact number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                    <Textarea 
                        label="Shipping Address *" 
                        placeholder="Detailed address..."
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-8">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onSave(formData)} disabled={!isValid}>Confirm & Pay</Button>
                </div>
            </Card>
        </div>
    );
};

const PaymentProcessingModal = ({ isOpen, onComplete, total }: { isOpen: boolean, onComplete: () => void, total: number }) => {
    const [status, setStatus] = useState<'processing' | 'success'>('processing');

    useEffect(() => {
        if (isOpen) {
            setStatus('processing');
            const timer1 = setTimeout(() => {
                setStatus('success');
                const timer2 = setTimeout(() => {
                    onComplete();
                }, 1200);
                return () => clearTimeout(timer2);
            }, 2000);
            return () => clearTimeout(timer1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
            <Card className="max-w-xs w-full p-8 flex flex-col items-center justify-center text-center shadow-2xl animate-scale-in">
                <div className="mb-6 h-16 flex items-center justify-center">
                    {status === 'processing' ? (
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    ) : (
                        <div className="animate-bounce-in text-green-500">
                            <Icons.CheckCircle />
                        </div>
                    )}
                </div>
                
                <h3 className="text-xl font-bold mb-2">
                    {status === 'processing' ? 'Processing Payment...' : 'Payment Successful!'}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                    Amount: <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
                </p>
                
                {status === 'processing' && (
                    <p className="text-xs text-gray-400">Verifying transaction securely</p>
                )}
            </Card>
        </div>
    );
};

export const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, updateProfile } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [shippingData, setShippingData] = useState({ address: '', phone: '', realName: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const performCheckout = async () => {
    if (!user) return;
    setIsProcessing(true);
    setIsPaymentModalOpen(false);
    
    try {
        const res = await API.createOrder({
          userId: user.id,
          items: cart,
          total,
          address: shippingData.address,
          phone: shippingData.phone,
          realName: shippingData.realName
        });

        if (res.success) {
          clearCart();
          notify('Order placed successfully!', 'success');
          navigate('/orders');
        } else {
            notify(res.message || 'Payment failed. Please try again.', 'error');
        }
    } catch (err) {
        notify('Network error. Please check your connection.', 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCheckoutInitiation = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Trigger modal if any essential info is missing
    if (!user.address || !user.phone || !user.realName) {
        setIsShippingModalOpen(true);
    } else {
        setShippingData({ 
            address: user.address, 
            phone: user.phone, 
            realName: user.realName 
        });
        setIsPaymentModalOpen(true);
    }
  };

  const handleShippingSave = async (data: {address: string, phone: string, realName: string}) => {
      if (!user) return;
      
      // Update profile with the new contact details
      const updateRes = await API.updateUser(user.id, data);
      if (updateRes.success && updateRes.data) {
          updateProfile(updateRes.data);
      }
      
      setShippingData(data);
      setIsShippingModalOpen(false);
      setIsPaymentModalOpen(true);
  };

  if (cart.length === 0) return <div className="text-center py-20 text-gray-500">Your cart is empty.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <Card className="divide-y divide-gray-100 mb-6">
        {cart.map(item => (
          <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link to={`/products/${item.id}`} className="flex-shrink-0">
               <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
            </Link>
            <div className="flex-grow">
              <Link to={`/products/${item.id}`} className="font-medium hover:text-blue-600 line-clamp-1">{item.name}</Link>
              <div className="text-sm text-gray-500 mt-1">${item.price.toFixed(2)} each</div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded">
                    <button 
                        className="px-3 py-1 hover:bg-gray-50 text-gray-600"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                    >-</button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button 
                        className="px-3 py-1 hover:bg-gray-50 text-gray-600"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                    >+</button>
                </div>
                <div className="font-bold min-w-[60px] text-right">${(item.price * item.quantity).toFixed(2)}</div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
            </div>
          </div>
        ))}
        <div className="p-4 bg-gray-50 flex justify-between items-center">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-xl text-blue-600">${total.toFixed(2)}</span>
        </div>
      </Card>
      
      {user?.address && user?.phone && user?.realName && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-800 font-bold">
                  <Icons.User />
                  <span>{user.realName} | {user.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-blue-700">
                  <Icons.MapPin />
                  <p>{user.address}</p>
              </div>
              <button 
                onClick={() => setIsShippingModalOpen(true)}
                className="text-xs text-blue-600 underline mt-2"
              >
                Change shipping info
              </button>
          </div>
      )}

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="ghost" onClick={clearCart}>Clear Cart</Button>
        <Button onClick={handleCheckoutInitiation} isLoading={isProcessing}>Checkout & Pay</Button>
      </div>

      <ShippingDetailsModal 
        isOpen={isShippingModalOpen} 
        onClose={() => setIsShippingModalOpen(false)} 
        onSave={handleShippingSave}
        initialData={{ address: user?.address, phone: user?.phone, realName: user?.realName }}
      />

      <PaymentProcessingModal 
        isOpen={isPaymentModalOpen} 
        total={total} 
        onComplete={performCheckout} 
      />
    </div>
  );
};