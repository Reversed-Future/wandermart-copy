import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Icons } from '../components/ui';
import * as API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';

export const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const res = await API.createOrder({
      userId: user.id,
      items: cart,
      total
    });
    if (res.success) {
      clearCart();
      notify('Order placed successfully!', 'success');
      navigate('/orders');
    }
  };

  if (cart.length === 0) return <div className="text-center py-20 text-gray-500">Your cart is empty.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <Card className="divide-y divide-gray-100">
        {cart.map(item => (
          <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link to={`/products/${item.id}`} className="flex-shrink-0">
               <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
            </Link>
            <div className="flex-grow">
              <Link to={`/products/${item.id}`} className="font-medium hover:text-blue-600 line-clamp-1">{item.name}</Link>
              <div className="text-sm text-gray-500 mt-1">
                  ${item.price.toFixed(2)} each 
                  <span className="mx-2 text-gray-300">|</span> 
                  <span className="text-xs text-gray-400">Stock: {item.stock}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <div className="flex flex-col items-center">
                    <div className="flex items-center border border-gray-200 rounded">
                        <button 
                            className="px-3 py-1 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >-</button>
                        <input 
                            type="number"
                            min="1"
                            max={item.stock}
                            className="w-14 text-center text-sm py-1 border-x border-gray-200 font-medium focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={item.quantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                    updateQuantity(item.id, val);
                                }
                            }}
                            onBlur={(e) => {
                                let val = parseInt(e.target.value);
                                if (isNaN(val) || val < 1) {
                                    updateQuantity(item.id, 1);
                                } else if (val > item.stock) {
                                    updateQuantity(item.id, item.stock);
                                }
                            }}
                        />
                        <button 
                            className="px-3 py-1 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                        >+</button>
                    </div>
                </div>

                <div className="font-bold min-w-[80px] text-right">${(item.price * item.quantity).toFixed(2)}</div>
                
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                  <Icons.Trash />
                </button>
            </div>
          </div>
        ))}
        <div className="p-4 bg-gray-50 flex justify-between items-center">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-xl text-blue-600">${total.toFixed(2)}</span>
        </div>
      </Card>
      <div className="mt-6 flex justify-end gap-4">
        <Button variant="ghost" onClick={clearCart}>Clear Cart</Button>
        <Button onClick={handleCheckout}>Checkout</Button>
      </div>
    </div>
  );
};