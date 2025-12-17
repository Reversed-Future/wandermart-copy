import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Icons } from '../components/ui';
import * as API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';

export const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useCart();
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
          <div key={item.id} className="p-4 flex items-center gap-4">
            <Link to={`/products/${item.id}`}>
               <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
            </Link>
            <div className="flex-grow">
              <Link to={`/products/${item.id}`} className="font-medium hover:text-blue-600">{item.name}</Link>
              <p className="text-sm text-gray-500">${item.price} x {item.quantity}</p>
            </div>
            <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
              <Icons.Trash />
            </button>
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