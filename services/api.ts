import { Attraction, Post, Product, User, UserRole, Order, ApiResponse, NotificationMessage } from '../types';

const API_BASE = '/api/v1';
const DELAY_MS = 600;

export const getApiMode = (): 'mock' | 'real' => {
  return (localStorage.getItem('api_mode') as 'mock' | 'real') || 'mock';
};

export const setApiMode = (mode: 'mock' | 'real') => {
  localStorage.setItem('api_mode', mode);
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

const MOCK_ATTRACTIONS: Attraction[] = [
  {
    id: '1',
    title: 'Chengdu Research Base of Giant Panda Breeding',
    description: 'A world-renowned breeding and research center for giant pandas.',
    address: '1375 Panda Rd, Chenghua District, Chengdu',
    province: '四川省',
    city: '成都市',
    county: '成华区',
    region: '四川省 成都市 成华区',
    tags: ['Nature', 'Animals', 'Family'],
    imageUrl: 'https://picsum.photos/800/600?random=1',
    imageUrls: ['https://picsum.photos/800/600?random=1', 'https://picsum.photos/800/600?random=101', 'https://picsum.photos/800/600?random=102'],
    openHours: '07:30 - 18:00',
    drivingTips: 'Accessible by Metro Line 3. Parking available at South Gate.',
    travelerTips: 'Arrive early in the morning (before 9 AM) to see active pandas during feeding time.',
    status: 'active'
  },
  {
    id: '2',
    title: 'The Palace Museum (Forbidden City)',
    description: 'Imperial palace of the Ming and Qing dynasties. A masterpiece of Chinese architecture.',
    address: '4 Jingshan Front St, Dongcheng District, Beijing',
    province: '北京市',
    city: '市辖区',
    county: '东城区',
    region: '市辖区 东城区',
    tags: ['History', 'Culture', 'Architecture'],
    imageUrl: 'https://picsum.photos/800/600?random=2',
    imageUrls: ['https://picsum.photos/800/600?random=2', 'https://picsum.photos/800/600?random=201'],
    openHours: '08:30 - 17:00',
    drivingTips: 'No public parking. Use public transport (Metro Line 1).',
    travelerTips: 'Tickets must be booked online at least 7 days in advance. Closed on Mondays.',
    status: 'active'
  },
  {
    id: '3',
    title: 'West Lake Cultural Landscape',
    description: 'Freshwater lake divided by causeways, famous for its scenic beauty and temples.',
    address: 'Xihu District, Hangzhou, Zhejiang',
    province: '浙江省',
    city: '杭州市',
    county: '西湖区',
    region: '浙江省 杭州市',
    tags: ['Nature', 'History', 'Water'],
    imageUrl: 'https://picsum.photos/800/600?random=3',
    imageUrls: ['https://picsum.photos/800/600?random=3', 'https://picsum.photos/800/600?random=301'],
    openHours: '24 Hours',
    drivingTips: 'Traffic restrictions on weekends based on license plates.',
    travelerTips: 'Best viewed by boat. Sunset at Leifeng Pagoda is spectacular.',
    status: 'active'
  }
];

const MOCK_POSTS: Post[] = [
    {
      id: 'post-101',
      attractionId: '1',
      userId: 'u1',
      username: 'Traveler User',
      content: 'Absolutely breathtaking views!',
      rating: 5,
      likes: 12,
      comments: [],
      createdAt: new Date().toISOString(),
      status: 'active',
      imageUrls: ['https://picsum.photos/800/600?random=501']
    }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    merchantId: 'm1',
    merchantName: 'Panda Souvenirs',
    attractionId: '1',
    attractionName: 'Chengdu Research Base of Giant Panda Breeding',
    name: 'Plush Panda Toy',
    description: 'Soft and cuddly panda plush.',
    price: 25.00,
    stock: 100,
    imageUrl: 'https://picsum.photos/400/400?random=10',
    imageUrls: ['https://picsum.photos/400/400?random=10']
  }
];

const INITIAL_USERS: User[] = [
  { id: 'admin1', username: 'Admin User', email: 'admin@test.com', role: UserRole.ADMIN, status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=admin' },
  { id: 'm1', username: 'Merchant User', email: 'merchant@test.com', role: UserRole.MERCHANT, status: 'active', qualificationUrls: ['https://picsum.photos/200/300'], avatarUrl: 'https://i.pravatar.cc/150?u=merchant' },
  { id: 'u1', username: 'Traveler User', email: 'user@test.com', role: UserRole.TRAVELER, status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=traveler' },
];

const createNotification = (userId: string, title: string, content: string, type: NotificationMessage['type'] = 'info') => {
  const msgs = getStorage<NotificationMessage[]>('mock_notifications', []);
  const newMsg: NotificationMessage = {
    id: `msg-${Date.now()}-${Math.random()}`,
    userId,
    title,
    content,
    isRead: false,
    type,
    createdAt: new Date().toISOString()
  };
  setStorage('mock_notifications', [newMsg, ...msgs]);
};

const notifyAdmins = (title: string, content: string, type: NotificationMessage['type'] = 'info') => {
    const users = getStorage<User[]>('mock_users', INITIAL_USERS);
    const admins = users.filter(u => u.role === UserRole.ADMIN);
    admins.forEach(admin => {
        createNotification(admin.id, title, content, type);
    });
};

export const login = async (email: string, password: string): Promise<ApiResponse<User>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) return { success: true, data: { ...user, token: `mock-jwt-${user.id}` } };
  return { success: false, message: 'Invalid credentials.' };
};

export const register = async (userData: Partial<User>, password: string): Promise<ApiResponse<User>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  if (users.find(u => u.email === userData.email)) return { success: false, message: 'Email already exists' };
  const newUser: User = {
    id: `u-${Date.now()}`,
    username: userData.username || userData.email!.split('@')[0],
    email: userData.email!,
    role: userData.role || UserRole.TRAVELER,
    status: userData.role === UserRole.MERCHANT ? 'pending' : 'active',
    token: `mock-jwt-new`,
    avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
    qualificationUrls: userData.qualificationUrls
  };
  setStorage('mock_users', [...users, newUser]);

  if (newUser.role === UserRole.MERCHANT) {
      notifyAdmins('New Merchant Registered', `User ${newUser.username} has applied for a merchant account.`, 'warning');
  }

  return { success: true, data: newUser };
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return { success: false, message: 'User not found' };
  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  setStorage('mock_users', users);
  return { success: true, data: updatedUser };
};

export const getPendingMerchants = async (): Promise<ApiResponse<User[]>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  return { success: true, data: users.filter(u => u.role === UserRole.MERCHANT && u.status === 'pending') };
};

export const updateUserStatus = async (userId: string, status: 'active' | 'rejected'): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  const updatedUsers = users.map(u => u.id === userId ? { ...u, status } : u);
  setStorage('mock_users', updatedUsers);
  createNotification(userId, 'Account Update', `Your application has been ${status}.`, status === 'active' ? 'success' : 'error');
  return { success: true, data: true };
};

export const getAttractions = async (filters: any = {}): Promise<ApiResponse<Attraction[]>> => {
  await delay(DELAY_MS);
  let data = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  const posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  data = data.filter(a => a.status === 'active');
  if (filters.province) data = data.filter(a => a.province === filters.province);
  const result = data.map(attr => {
    const attrPosts = posts.filter(p => p.attractionId === attr.id && p.status === 'active');
    const avg = attrPosts.length > 0 ? attrPosts.reduce((acc, p) => acc + (p.rating || 0), 0) / attrPosts.length : 0;
    return { ...attr, reviewCount: attrPosts.length, averageRating: avg };
  });
  return { success: true, data: result };
};

export const getPendingAttractions = async (): Promise<ApiResponse<Attraction[]>> => {
  await delay(DELAY_MS);
  const data = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  return { success: true, data: data.filter(a => a.status === 'pending') };
};

export const getAttractionById = async (id: string): Promise<ApiResponse<Attraction>> => {
  await delay(DELAY_MS);
  const data = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  const attraction = data.find(a => a.id === id);
  return attraction ? { success: true, data: attraction } : { success: false, message: 'Not found' };
};

export const createAttraction = async (attractionData: Partial<Attraction>): Promise<ApiResponse<Attraction>> => {
  await delay(DELAY_MS);
  const attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  const newAttraction: Attraction = {
    ...attractionData as Attraction,
    id: `attr-${Date.now()}`,
    status: attractionData.status || 'active'
  };
  setStorage('mock_attractions', [newAttraction, ...attractions]);

  if (newAttraction.status === 'pending') {
      notifyAdmins('New Attraction Suggested', `"${newAttraction.title}" has been suggested and needs review.`, 'info');
  }

  return { success: true, data: newAttraction };
};

export const updateAttraction = async (id: string, updates: Partial<Attraction>): Promise<ApiResponse<Attraction>> => {
  await delay(DELAY_MS);
  const attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  const index = attractions.findIndex(a => a.id === id);
  if (index === -1) return { success: false, message: 'Not found' };
  attractions[index] = { ...attractions[index], ...updates };
  setStorage('mock_attractions', attractions);
  return { success: true, data: attractions[index] };
};

export const deleteAttraction = async (id: string): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  let attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  setStorage('mock_attractions', attractions.filter(a => a.id !== id));
  return { success: true, data: true };
};

export const getPosts = async (attractionId?: string): Promise<ApiResponse<Post[]>> => {
  await delay(DELAY_MS);
  const allPosts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  const visiblePosts = allPosts.filter(p => p.status === 'active');
  return { success: true, data: attractionId ? visiblePosts.filter(p => p.attractionId === attractionId) : visiblePosts };
};

export const createPost = async (postData: Partial<Post>): Promise<ApiResponse<Post>> => {
  await delay(DELAY_MS);
  const newPost: Post = {
    ...postData as Post,
    id: `post-${Date.now()}`,
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  const posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  setStorage('mock_posts', [newPost, ...posts]);
  return { success: true, data: newPost };
};

export const updatePost = async (id: string, updates: Partial<Post>): Promise<ApiResponse<Post>> => {
  await delay(DELAY_MS);
  const posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return { success: false, message: 'Post not found' };
  const updatedPost = { ...posts[index], ...updates };
  posts[index] = updatedPost;
  setStorage('mock_posts', posts);
  return { success: true, data: updatedPost };
};

export const deletePost = async (id: string): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  let posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  setStorage('mock_posts', posts.filter(p => p.id !== id));
  return { success: true, data: true };
};

export const reportPost = async (postId: string, reporterId?: string): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  const posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  const index = posts.findIndex(p => p.id === postId);
  if (index !== -1) {
      const updated = posts.map(p => p.id === postId ? { ...p, status: 'reported' as const } : p);
      setStorage('mock_posts', updated);
      notifyAdmins('Content Reported', `A review for attraction ID ${posts[index].attractionId} has been reported.`, 'error');
  }
  return { success: true, data: true };
};

export const getProducts = async (filters: any = {}): Promise<ApiResponse<Product[]>> => {
  await delay(DELAY_MS);
  let allProducts = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  if (filters.merchantId) allProducts = allProducts.filter(p => p.merchantId === filters.merchantId);
  if (filters.attractionId) allProducts = allProducts.filter(p => p.attractionId === filters.attractionId);
  return { success: true, data: allProducts };
};

export const getProductById = async (id: string): Promise<ApiResponse<Product>> => {
  await delay(DELAY_MS);
  const allProducts = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  const product = allProducts.find(p => p.id === id);
  return product ? { success: true, data: product } : { success: false, message: 'Not found' };
};

export const createProduct = async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
  await delay(DELAY_MS);
  const newProduct: Product = { ...product as Product, id: `prod-${Date.now()}` };
  const products = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  setStorage('mock_products', [...products, newProduct]);
  return { success: true, data: newProduct };
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> => {
  await delay(DELAY_MS);
  const products = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return { success: false, message: 'Not found' };
  products[index] = { ...products[index], ...updates };
  setStorage('mock_products', products);
  return { success: true, data: products[index] };
};

export const deleteProduct = async (id: string): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  let products = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  setStorage('mock_products', products.filter(p => p.id !== id));
  return { success: true, data: true };
};

export const createOrder = async (orderData: Partial<Order>): Promise<ApiResponse<Order>> => {
  await delay(DELAY_MS);
  const now = new Date();
  const dateStr = now.toISOString().slice(2,10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderId = `WM-${dateStr}-${randomStr}`;

  const newOrder: Order = {
    id: orderId,
    userId: orderData.userId!,
    items: orderData.items!,
    total: orderData.total!,
    address: orderData.address!,
    phone: orderData.phone!,
    realName: orderData.realName!,
    status: 'pending',
    createdAt: now.toISOString()
  };
  const orders = getStorage<Order[]>('mock_orders', []);
  setStorage('mock_orders', [newOrder, ...orders]);
  
  const merchantIds = Array.from(new Set(newOrder.items.map(i => i.merchantId)));
  merchantIds.forEach(mId => {
      createNotification(mId, 'New Order Received', `Order ${newOrder.id} has been placed for $${newOrder.total}.`, 'success');
  });

  return { success: true, data: newOrder };
};

export const getOrders = async (userId?: string, merchantId?: string): Promise<ApiResponse<Order[]>> => {
  await delay(DELAY_MS);
  let orders = getStorage<Order[]>('mock_orders', []);
  if (userId) orders = orders.filter(o => o.userId === userId);
  if (merchantId) orders = orders.filter(o => o.items.some(i => i.merchantId === merchantId));
  return { success: true, data: orders };
};

export const updateOrderStatus = async (orderId: string, status: Order['status'], trackingNumber?: string): Promise<ApiResponse<Order>> => {
  await delay(DELAY_MS);
  const orders = getStorage<Order[]>('mock_orders', []);
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return { success: false, message: 'Order not found' };
  orders[index] = { ...orders[index], status, trackingNumber: trackingNumber || orders[index].trackingNumber };
  setStorage('mock_orders', orders);
  createNotification(orders[index].userId, 'Order Updated', `Your order ${orderId} is now ${status}.`, 'info');
  return { success: true, data: orders[index] };
};

export const getReportedContent = async (): Promise<ApiResponse<Post[]>> => {
  await delay(DELAY_MS);
  const posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  return { success: true, data: posts.filter(p => p.status === 'reported') };
};

export const moderateContent = async (id: string, action: 'approve' | 'delete'): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  let posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  if (action === 'delete') posts = posts.filter(p => p.id !== id);
  else posts = posts.map(p => p.id === id ? { ...p, status: 'active' as const } : p);
  setStorage('mock_posts', posts);
  return { success: true, data: true };
};

export const getMessages = async (userId: string): Promise<ApiResponse<NotificationMessage[]>> => {
  const msgs = getStorage<NotificationMessage[]>('mock_notifications', []);
  return { success: true, data: msgs.filter(m => m.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
};

export const markMessageRead = async (messageId: string): Promise<ApiResponse<boolean>> => {
  const msgs = getStorage<NotificationMessage[]>('mock_notifications', []);
  setStorage('mock_notifications', msgs.map(m => m.id === messageId ? { ...m, isRead: true } : m));
  return { success: true, data: true };
};

export const markAllMessagesRead = async (userId: string): Promise<ApiResponse<boolean>> => {
    const msgs = getStorage<NotificationMessage[]>('mock_notifications', []);
    setStorage('mock_notifications', msgs.map(m => m.userId === userId ? { ...m, isRead: true } : m));
    return { success: true, data: true };
};

export const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}