import React, { createContext, useContext, useState } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (p: Product, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({ cart: [], addToCart: () => {}, removeFromCart: () => {}, clearCart: () => {} });

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const addToCart = (p: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...p, quantity: qty }];
    });
  };
  
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};