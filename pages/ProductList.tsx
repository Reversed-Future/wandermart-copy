import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Icons } from '../components/ui';
import * as API from '../services/api';
import { Product, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    API.getProducts().then(res => res.data && setProducts(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Local Marketplace</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <Card key={product.id} className="flex flex-col h-full">
            <Link to={`/products/${product.id}`} className="block">
              <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover hover:opacity-90 transition-opacity" />
            </Link>
            <div className="p-4 flex flex-col flex-grow">
              <Link to={`/products/${product.id}`} className="block">
                <h3 className="font-bold text-lg hover:text-blue-600 transition-colors">{product.name}</h3>
              </Link>
              <div className="mb-2">
                 <p className="text-gray-500 text-xs">Sold by {product.merchantName}</p>
                 {product.attractionName && (
                   <Link to={`/attractions/${product.attractionId}`} className="text-xs text-purple-600 font-medium hover:underline block mt-1">
                     📍 {product.attractionName}
                   </Link>
                 )}
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
                {user?.role !== UserRole.MERCHANT && (
                  <Button onClick={() => addToCart(product, 1)} className="text-xs" variant="secondary">
                     Add to Cart
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};