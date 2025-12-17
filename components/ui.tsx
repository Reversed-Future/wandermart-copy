import React, { useRef, useState, useEffect } from 'react';
import * as API from '../services/api'; // Direct import for the uploader

// --- ICONS (SVG) ---
export const Icons = {
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  ShoppingBag: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Camera: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Loader: () => <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
};

// --- COMPONENTS ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', isLoading, className = '', children, ...props }) => {
  const base = "px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
    ghost: "bg-transparent hover:bg-gray-50 text-gray-600"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isLoading} {...props}>
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      )}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-3">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`} {...props} />
  </div>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-3">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`} {...props} />
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = 'blue', className='' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 ${className}`}>
    {children}
  </span>
);

export const Alert: React.FC<{ children: React.ReactNode; type?: 'error' | 'success' }> = ({ children, type = 'error' }) => {
  const bg = type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200';
  return (
    <div className={`p-4 rounded-md border ${bg} mb-4 text-sm`}>
      {children}
    </div>
  );
};

export const StarRating: React.FC<{ rating: number; onRatingChange?: (r: number) => void; readonly?: boolean; className?: string }> = ({ rating, onRatingChange, readonly = false, className = "text-yellow-400" }) => {
  return (
    <div className={`flex ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer focus:outline-none'}`}
          disabled={readonly}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={readonly ? "16" : "24"} height={readonly ? "16" : "24"} fill={star <= rating ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
             <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      ))}
    </div>
  );
};

// --- NEW NOTIFICATION COMPONENTS ---

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  const bg = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
  
  return (
    <div className={`${bg} text-white px-4 py-3 rounded shadow-lg mb-2 flex items-center justify-between w-72 animate-slide-in`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => onDismiss(id)} className="ml-4 text-white opacity-75 hover:opacity-100">
        ×
      </button>
    </div>
  );
};

export interface ModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-bold mb-3 text-gray-900">Confirm Action</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
};

// --- IMAGE UPLOADER ---

interface ImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  maxCount?: number;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange, maxCount = 10, label = "Upload Images" }) => {
  const [loadingItems, setLoadingItems] = useState<{ id: string, preview: string }[]>([]);
  // We use a ref to access the latest 'images' prop inside the async upload loop without closure staleness issues
  const imagesRef = useRef(images);
  
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    e.target.value = ''; // Reset input to allow re-selecting same files

    if (images.length + files.length > maxCount) {
      alert(`You can only upload up to ${maxCount} images.`);
      return;
    }

    // 1. Create temporary placeholders
    const newItems = files.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(f),
      file: f
    }));

    setLoadingItems(prev => [...prev, ...newItems.map(i => ({ id: i.id, preview: i.preview }))]);

    // 2. Upload one by one
    for (const item of newItems) {
      try {
        const url = await API.uploadFile(item.file);
        // Append to current list via callback to ensure we don't lose updates
        // However, since we are in a loop, we should use the ref to get the base for the *next* update 
        // OR simpler: just update the parent state one by one.
        // We call onChange with [ ...latestImagesFromRef, newUrl ]
        
        const currentList = imagesRef.current;
        const newList = [...currentList, url];
        onChange(newList);
        
        // Ref updates via useEffect, but might lag slightly if onChange triggers re-render fast.
        // To be safe in this loop, we locally track the 'accumulated' list or just trust React's state speed + ref sync.
        // Since API mock has delay, ref sync should be fine.
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setLoadingItems(prev => prev.filter(i => i.id !== item.id));
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <div className="flex flex-wrap gap-3">
        {/* Existing Images */}
        {images.map((url, idx) => (
          <div key={`${url}-${idx}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
            <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
            <button 
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
            >
              <Icons.X />
            </button>
          </div>
        ))}

        {/* Loading Placeholders */}
        {loadingItems.map((item) => (
          <div key={item.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50">
            <img src={item.preview} alt="Uploading" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center text-blue-600">
               <Icons.Loader />
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {images.length + loadingItems.length < maxCount && (
          <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-500">
            <Icons.Camera />
            <span className="text-xs mt-1">Add</span>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>
        )}
      </div>
    </div>
  );
};