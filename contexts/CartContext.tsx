import React, { createContext, useContext, useState } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (p: Product, qty: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({ 
    cart: [], 
    addToCart: () => {}, 
    removeFromCart: () => {}, 
    updateQuantity: () => {}, 
    clearCart: () => {} 
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const addToCart = (p: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) {
          // Check stock limit
          const newQty = Math.min(existing.quantity + qty, existing.stock);
          return prev.map(i => i.id === p.id ? { ...i, quantity: newQty } : i);
      }
      // Ensure initial add doesn't exceed stock
      return [...prev, { ...p, quantity: Math.min(qty, p.stock) }];
    });
  };
  
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  
  const updateQuantity = (id: string, qty: number) => {
      setCart(prev => prev.map(i => {
          if (i.id === id) {
              // Clamp quantity between 1 and available stock
              const newQty = Math.max(1, Math.min(qty, i.stock));
              return { ...i, quantity: newQty };
          }
          return i;
      }));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};