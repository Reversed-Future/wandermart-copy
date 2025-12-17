
export enum UserRole {
  GUEST = 'guest',
  TRAVELER = 'traveler',
  MERCHANT = 'merchant',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  token?: string;
  status: 'active' | 'pending' | 'rejected'; // Account status
  qualificationUrl?: string; // Kept for backward compat
  qualificationUrls?: string[]; // New: multiple pages
  avatarUrl?: string; // New: User profile picture
}

export interface Attraction {
  id: string;
  title: string;
  description: string;
  address: string;
  region: string; // Keep for display formatted string
  province?: string;
  city?: string;
  county?: string;
  tags: string[];
  imageUrl: string; // Primary cover image
  imageUrls?: string[]; // All images including cover
  gallery?: string[]; // Legacy field, mapped to imageUrls slice(1)
  openHours?: string;
  drivingTips?: string;
  status: 'active' | 'pending' | 'rejected'; // New field for approval workflow
  submittedBy?: string; // New field to track who uploaded it
  submittedById?: string; // ID of the user who submitted it
}

export interface Post {
  id: string;
  attractionId: string;
  userId: string;
  username: string;
  content: string;
  rating?: number; // 1-5 star rating
  imageUrl?: string; // Legacy single image
  imageUrls?: string[]; // New: multiple images
  likes: number;
  comments: Comment[];
  createdAt: string;
  status: 'active' | 'reported' | 'hidden';
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export interface Product {
  id: string;
  merchantId: string;
  merchantName: string;
  attractionId?: string; // Associated map location/attraction
  attractionName?: string; // Denormalized for display
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string; // Primary
  imageUrls?: string[]; // Multiple
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
}

export interface NotificationMessage {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error'; // For icon/color
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
