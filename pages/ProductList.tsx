import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, Icons, Input, Badge } from '../components/ui';
import * as API from '../services/api';
import { Product, UserRole, Attraction } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { REGION_DATA } from '../data/china_regions';

export const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Filter State
  const query = searchParams.get('q') || '';
  const province = searchParams.get('province') || '';
  const city = searchParams.get('city') || '';
  const county = searchParams.get('county') || '';
  const attractionId = searchParams.get('attractionId') || '';

  const provinces = Object.keys(REGION_DATA);
  const cities = province && REGION_DATA[province] ? Object.keys(REGION_DATA[province]) : [];
  const counties = province && city && REGION_DATA[province][city] ? REGION_DATA[province][city] : [];

  // Fetch attractions based on current region filters
  useEffect(() => {
    API.getAttractions({ province, city, county }).then(res => {
        if (res.data) setAttractions(res.data);
    });
  }, [province, city, county]);

  useEffect(() => {
    setLoading(true);
    API.getProducts({ query, province, city, county, attractionId }).then(res => {
        if (res.data) setProducts(res.data);
        setLoading(false);
    });
  }, [query, province, city, county, attractionId]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    // Reset dependent fields
    if (key === 'province') {
      newParams.delete('city');
      newParams.delete('county');
      newParams.delete('attractionId');
    }
    if (key === 'city') {
      newParams.delete('county');
      newParams.delete('attractionId');
    }
    if (key === 'county') {
      newParams.delete('attractionId');
    }

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Local Marketplace</h1>
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Input 
                    placeholder="Search products by name, description, or attraction..." 
                    value={query} 
                    onChange={(e) => updateFilter('q', e.target.value)} 
                    className="pl-10"
                />
                <div className="absolute top-2.5 left-3 text-gray-400"><Icons.Search /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select 
                    className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                    value={province}
                    onChange={(e) => updateFilter('province', e.target.value)}
                >
                    <option value="">All Provinces</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <select 
                    className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full disabled:bg-gray-100 disabled:text-gray-400"
                    value={city}
                    onChange={(e) => updateFilter('city', e.target.value)}
                    disabled={!province}
                >
                    <option value="">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select 
                    className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full disabled:bg-gray-100 disabled:text-gray-400"
                    value={county}
                    onChange={(e) => updateFilter('county', e.target.value)}
                    disabled={!city}
                >
                    <option value="">All Districts</option>
                    {counties.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select 
                    className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                    value={attractionId}
                    onChange={(e) => updateFilter('attractionId', e.target.value)}
                >
                    <option value="">All Attractions</option>
                    {attractions.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
            </div>

            {(query || province || city || county || attractionId) && (
                <div className="flex justify-end">
                    <Button variant="ghost" onClick={clearFilters} className="text-sm">
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
      </div>

      {loading ? <div className="text-center py-10">Loading products...</div> : (
        <>
            {products.length === 0 ? (
                 <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                    No products found matching your criteria.
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                    <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-200">
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
                            <Link to={`/attractions/${product.attractionId}`} className="text-xs text-gray-500 font-medium hover:underline block mt-1">
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
            )}
        </>
      )}
    </div>
  );
};