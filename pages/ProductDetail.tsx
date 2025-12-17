import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Icons } from '../components/ui';
import * as API from '../services/api';
import { Product, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (id) {
      API.getProductById(id).then(res => {
        if (res.data) {
            setProduct(res.data);
            setSelectedImage(res.data.imageUrl);
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
       <Link to="/products" className="text-gray-500 hover:text-blue-600 mb-4 inline-block">&larr; Back to Marketplace</Link>
       <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow-sm">
         <div className="flex flex-col gap-4">
             <img src={selectedImage || product.imageUrl} alt={product.name} className="w-full h-80 object-cover rounded-lg" />
             {product.imageUrls && product.imageUrls.length > 1 && (
                 <div className="flex gap-2 overflow-x-auto pb-2">
                     {product.imageUrls.map((url, idx) => (
                         <img 
                            key={idx} 
                            src={url} 
                            onClick={() => setSelectedImage(url)} 
                            className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${selectedImage === url ? 'border-blue-600' : 'border-transparent'}`} 
                        />
                     ))}
                 </div>
             )}
         </div>
         <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex flex-col gap-1 mb-6 border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-500">Sold by {product.merchantName}</span>
              {product.attractionName && (
                <div className="flex items-center gap-1 text-sm text-purple-700 font-medium">
                  <Icons.MapPin />
                  <span>Available at: </span>
                  <Link to={`/attractions/${product.attractionId}`} className="hover:underline">
                    {product.attractionName}
                  </Link>
                </div>
              )}
            </div>
            
            <div className="text-2xl font-bold text-blue-600 mb-6">${product.price.toFixed(2)}</div>
            
            <p className="text-gray-700 mb-8 leading-relaxed flex-grow">{product.description}</p>
            
            <div className="mt-auto pt-6 border-t border-gray-100">
               <div className="flex items-center justify-between mb-4">
                 <span className="text-sm text-gray-600">In Stock: {product.stock}</span>
               </div>
               {user?.role !== UserRole.MERCHANT && (
                  <Button onClick={() => addToCart(product, 1)} className="w-full py-3 text-lg">
                    Add to Cart
                  </Button>
               )}
            </div>
         </div>
       </div>
    </div>
  );
};