import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, Badge, Icons, Alert, Textarea, StarRating, ImageUploader } from '../components/ui';
import * as API from '../services/api';
import { Attraction, Post, Product, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';

export const AttractionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { notify, confirm } = useNotification();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [newPostContent, setNewPostContent] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editImages, setEditImages] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      Promise.all([
        API.getAttractionById(id),
        API.getPosts(id),
        API.getProducts({ attractionId: id })
      ]).then(([attrRes, postRes, prodRes]) => {
        if (attrRes.data) setAttraction(attrRes.data);
        if (postRes.data) setPosts(postRes.data);
        if (prodRes.data) setProducts(prodRes.data);
        setLoading(false);
        setActiveImageIndex(0);
      });
    }
  }, [id]);

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || !user || !id) return;
    setIsSubmitting(true);
    
    const res = await API.createPost({
      attractionId: id,
      userId: user.id,
      username: user.username,
      content: newPostContent,
      rating: newRating,
      imageUrls: newPostImages,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      status: 'active'
    });

    if (res.success && res.data) {
      setPosts([res.data, ...posts]);
      setNewPostContent('');
      setNewRating(5);
      setNewPostImages([]);
      notify("Review posted successfully!", "success");
    }
    setIsSubmitting(false);
  };

  const handleReport = (postId: string) => {
    confirm("Report this review? It will be submitted for admin moderation.", async () => {
      await API.reportPost(postId, user?.id);
      setPosts(posts.filter(p => p.id !== postId));
      notify("Review reported. It has been hidden and sent to admins for review.", "info");
    });
  };

  const startEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    setEditRating(post.rating || 0);
    setEditImages(post.imageUrls || []);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditContent('');
    setEditRating(0);
    setEditImages([]);
  };

  const saveEdit = async () => {
     if (!editingPostId) return;
     const res = await API.updatePost(editingPostId, {
         content: editContent,
         rating: editRating,
         imageUrls: editImages
     });
     if (res.success && res.data) {
         setPosts(posts.map(p => p.id === editingPostId ? res.data! : p));
         notify("Review updated", "success");
         cancelEdit();
     }
  };

  const handleDeletePost = async (postId: string) => {
      confirm("Delete your review?", async () => {
          const res = await API.deletePost(postId);
          if (res.success) {
              setPosts(posts.filter(p => p.id !== postId));
              notify("Review deleted", "info");
          }
      });
  };

  if (loading) return <div>Loading...</div>;
  if (!attraction) return <div>Not found</div>;

  const allImages = attraction.imageUrls && attraction.imageUrls.length > 0 
      ? attraction.imageUrls 
      : [attraction.imageUrl];

  const handlePrevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <div className="relative group mb-6 rounded-xl overflow-hidden shadow-sm">
             <img src={allImages[activeImageIndex]} alt={attraction.title} className="w-full h-80 object-cover" />
             
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
             <div className="grid grid-cols-4 gap-2 mb-6">
                {allImages.map((img, idx) => (
                   <img 
                     key={idx} 
                     src={img} 
                     alt={`Gallery ${idx}`} 
                     onClick={() => setActiveImageIndex(idx)}
                     className={`w-full h-24 object-cover rounded cursor-pointer hover:opacity-90 transition-all ${activeImageIndex === idx ? 'ring-2 ring-blue-500' : ''}`} 
                   />
                ))}
             </div>
          )}

          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-4">{attraction.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {attraction.province && <Badge color="blue">{attraction.province}</Badge>}
              {attraction.city && <Badge color="indigo">{attraction.city}</Badge>}
              {attraction.county && <Badge color="purple">{attraction.county}</Badge>}
              {attraction.tags.map(tag => <Badge key={tag} color="green">{tag}</Badge>)}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">{attraction.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Address</p>
                <div className="flex items-start gap-2">
                  <Icons.MapPin /> {attraction.address}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Open Hours</p>
                <p>{attraction.openHours || 'Not specified'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold text-gray-900">Driving Tips</p>
                <p className="italic">{attraction.drivingTips || 'No specific tips available.'}</p>
              </div>
            </div>
            
            <div className="mt-6">
               <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.address)}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2 font-medium">
                 View on External Map &rarr;
               </a>
            </div>
          </Card>
        </div>

        {products.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Icons.ShoppingBag />
              Featured Local Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(product => (
                 <Card key={product.id} className="p-4 flex gap-4">
                    <Link to={`/products/${product.id}`} className="flex-shrink-0">
                      <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded" />
                    </Link>
                    <div className="flex flex-col justify-between flex-grow">
                       <div>
                          <Link to={`/products/${product.id}`} className="font-bold line-clamp-1 hover:text-blue-600">{product.name}</Link>
                          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                       </div>
                       <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-blue-600">${product.price}</span>
                          {user?.role !== UserRole.MERCHANT && (
                            <Button onClick={() => addToCart(product, 1)} variant="secondary" className="px-2 py-1 text-xs">Add</Button>
                          )}
                       </div>
                    </div>
                 </Card>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Community Reviews</h2>
          
          {user ? (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Your Rating:</span>
                <StarRating rating={newRating} onRatingChange={setNewRating} />
              </div>
              <Textarea 
                placeholder="Share your experience..." 
                value={newPostContent} 
                onChange={e => setNewPostContent(e.target.value)} 
              />
              <ImageUploader 
                 images={newPostImages}
                 onChange={setNewPostImages}
                 maxCount={5}
                 label="Add Photos"
              />
              <div className="flex justify-end items-center mt-2">
                 <Button onClick={handlePostSubmit} disabled={!newPostContent || isSubmitting} isLoading={isSubmitting}>Post Review</Button>
              </div>
            </div>
          ) : (
            <Alert type="success">Login to share your experience!</Alert>
          )}

          <div className="space-y-6">
            {posts.length === 0 && <p className="text-gray-500 italic">No reviews yet.</p>}
            {posts.map(post => {
              const isOwner = user?.id === post.userId;
              
              if (editingPostId === post.id) {
                return (
                  <div key={post.id} className="border-b border-gray-100 last:border-0 pb-6 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-bold mb-2">Edit Review</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium">Rating:</span>
                      <StarRating rating={editRating} onRatingChange={setEditRating} />
                    </div>
                    <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} />
                    <ImageUploader images={editImages} onChange={setEditImages} maxCount={5} />
                    <div className="flex justify-end gap-2 mt-3">
                      <Button variant="ghost" onClick={cancelEdit} className="text-xs">Cancel</Button>
                      <Button onClick={saveEdit} className="text-xs">Save Changes</Button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={post.id} className="border-b border-gray-100 last:border-0 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-1 rounded-full"><Icons.User /></div>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {post.username}
                          {post.rating && <StarRating rating={post.rating} readonly />}
                        </div>
                        <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      {isOwner ? (
                        <>
                          <button onClick={() => startEdit(post)} className="text-blue-600 hover:underline font-medium">Edit</button>
                          <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:underline font-medium">Delete</button>
                        </>
                      ) : (
                        user && <button onClick={() => handleReport(post.id)} className="text-gray-400 hover:text-red-500 underline">Report</button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{post.content}</p>
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {post.imageUrls.map((url, idx) => (
                        <img key={idx} src={url} alt="User upload" className="w-24 h-24 object-cover rounded-lg border border-gray-100 cursor-pointer hover:opacity-90" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-4 bg-yellow-50 border-yellow-100">
           <h3 className="font-bold text-yellow-800 mb-2">Traveler Tips</h3>
           <p className="text-sm text-yellow-700">{attraction.travelerTips || 'Always check weather conditions before visiting natural attractions. Stay safe!'}</p>
        </Card>
      </div>
    </div>
  );
};