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
  status: 'active' | 'pending' | 'rejected';
  qualificationUrls?: string[];
  avatarUrl?: string;
  address?: string;
  phone?: string;
  realName?: string;
}

export interface Attraction {
  id: string;
  title: string;
  description: string;
  address: string;
  region: string;
  province?: string;
  city?: string;
  county?: string;
  tags: string[];
  imageUrl: string; // Used as cover image
  imageUrls?: string[]; // All images including cover
  openHours?: string;
  drivingTips?: string;
  travelerTips?: string;
  status: 'active' | 'pending' | 'rejected';
  submittedBy?: string;
  submittedById?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface Post {
  id: string;
  attractionId: string;
  userId: string;
  username: string;
  content: string;
  rating?: number;
  imageUrls?: string[];
  likes: number;
  createdAt: string;
  status: 'active' | 'reported' | 'hidden';
}

export interface Product {
  id: string;
  merchantId: string;
  merchantName: string;
  attractionId?: string;
  attractionName?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  imageUrls?: string[];
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
  address: string;
  phone: string;
  realName: string;
  createdAt: string;
}

export interface NotificationMessage {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}