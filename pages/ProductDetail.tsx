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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      API.getProductById(id).then(res => {
        if (res.data) {
            setProduct(res.data);
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  const allImages = product.imageUrls && product.imageUrls.length > 0 
      ? product.imageUrls 
      : [product.imageUrl];

  const handlePrevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-4xl mx-auto">
       <Link to="/products" className="text-gray-500 hover:text-blue-600 mb-4 inline-block">&larr; Back to Marketplace</Link>
       <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow-sm">
         <div className="flex flex-col gap-4">
             <div className="relative group rounded-xl overflow-hidden shadow-sm bg-gray-50 border border-gray-100">
                 <img src={allImages[activeImageIndex]} alt={product.name} className="w-full h-80 object-cover" />
                 
                 {allImages.length > 1 && (
                   <>
                     <button 
                       onClick={handlePrevImage}
                       className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 focus:outline-none"
                     >
                       <Icons.ChevronLeft />
                     </button>
                     <button 
                       onClick={handleNextImage}
                       className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 focus:outline-none"
                     >
                       <Icons.ChevronRight />
                     </button>
                     <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                         {activeImageIndex + 1} / {allImages.length}
                     </div>
                   </>
                 )}
             </div>

             {allImages.length > 1 && (
                 <div className="grid grid-cols-4 gap-2">
                     {allImages.map((url, idx) => (
                         <img 
                            key={idx} 
                            src={url} 
                            onClick={() => setActiveImageIndex(idx)} 
                            className={`w-full h-20 object-cover rounded cursor-pointer border-2 hover:opacity-90 transition-all ${activeImageIndex === idx ? 'border-blue-600' : 'border-transparent'}`} 
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
                <div className="flex items-center gap-1 text-sm text-gray-600 font-medium">
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