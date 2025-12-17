import { Attraction, Post, Product, User, UserRole, Order, ApiResponse, NotificationMessage } from '../types';

/**
 * CONFIGURATION
 * 
 * Base URL for the future backend API.
 * Currently, all functions below use a MOCK implementation using LocalStorage
 * to simulate a working backend.
 */
const API_BASE = '/api/v1';
const DELAY_MS = 600; // Simulate network latency

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to get/set from localStorage for persistence during demo
const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// --- MOCK DATA INITIALIZATION ---
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
    gallery: [
      'https://picsum.photos/800/600?random=101',
      'https://picsum.photos/800/600?random=102',
      'https://picsum.photos/800/600?random=103'
    ],
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
    gallery: [
      'https://picsum.photos/800/600?random=201',
      'https://picsum.photos/800/600?random=202'
    ],
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
    gallery: ['https://picsum.photos/800/600?random=301'],
    openHours: '24 Hours',
    drivingTips: 'Traffic restrictions on weekends based on license plates.',
    travelerTips: 'Best viewed by boat. Sunset at Leifeng Pagoda is spectacular.',
    status: 'active'
  },
  {
    id: '4',
    title: 'Jiuzhaigou Valley',
    description: 'Nature reserve and national park known for its many multi-level waterfalls and colorful lakes.',
    address: 'Jiuzhaigou County, Ngawa Tibetan and Qiang Autonomous Prefecture, Sichuan',
    province: '四川省',
    city: '阿坝藏族羌族自治州',
    county: '九寨沟县',
    region: '四川省 阿坝州',
    tags: ['Nature', 'Hiking', 'Photography'],
    imageUrl: 'https://picsum.photos/800/600?random=4',
    imageUrls: ['https://picsum.photos/800/600?random=4', 'https://picsum.photos/800/600?random=401', 'https://picsum.photos/800/600?random=402'],
    gallery: [
      'https://picsum.photos/800/600?random=401',
      'https://picsum.photos/800/600?random=402',
      'https://picsum.photos/800/600?random=403',
      'https://picsum.photos/800/600?random=404'
    ],
    openHours: '08:00 - 17:00',
    drivingTips: 'Mountain roads. Careful driving required in winter.',
    travelerTips: 'High altitude area, bring warm clothes even in summer. Allow at least 2 days for full exploration.',
    status: 'active'
  },
  {
    id: '5',
    title: 'Mount Qingcheng',
    description: 'One of the birthplaces of Taoism, featuring lush forests and ancient temples.',
    address: 'Dujiangyan, Chengdu, Sichuan',
    province: '四川省',
    city: '成都市',
    county: '都江堰市',
    region: '四川省 成都市',
    tags: ['Culture', 'Hiking', 'Mountain'],
    imageUrl: 'https://picsum.photos/800/600?random=5',
    imageUrls: ['https://picsum.photos/800/600?random=5'],
    openHours: '08:00 - 17:30',
    drivingTips: 'Take Chengguan Expressway. Parking lot is 2km from gate (shuttle available).',
    travelerTips: 'The cable car saves time, but hiking up gives better views of the temples.',
    status: 'active'
  },
  {
    id: '6',
    title: 'The Great Wall (Mutianyu)',
    description: 'One of the best-preserved sections of the Great Wall, offering spectacular views and less crowding.',
    address: 'Mutianyu Road, Huairou District, Beijing',
    province: '北京市',
    city: '市辖区',
    county: '怀柔区',
    region: '北京市 怀柔区',
    tags: ['History', 'Hiking', 'Architecture', 'Mountain'],
    imageUrl: 'https://picsum.photos/800/600?random=6',
    imageUrls: ['https://picsum.photos/800/600?random=6', 'https://picsum.photos/800/600?random=601'],
    gallery: ['https://picsum.photos/800/600?random=601'],
    openHours: '07:30 - 17:30',
    drivingTips: 'About 1.5 hours drive from Beijing city center. Parking is spacious.',
    travelerTips: 'Take the toboggan down for a fun experience!',
    status: 'active'
  }
];

const MOCK_POSTS: Post[] = [
    {
      id: 'post-101',
      attractionId: '6',
      userId: 'u1',
      username: 'Traveler User',
      content: 'Absolutely breathtaking views! The climb was steep but worth every step.',
      rating: 5,
      likes: 12,
      comments: [],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      status: 'active'
    },
    {
      id: 'post-102',
      attractionId: '6',
      userId: 'u2',
      username: 'Hiker123',
      content: 'Less crowded than Badaling. The autumn colors were amazing.',
      rating: 5,
      likes: 8,
      comments: [],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      status: 'active'
    },
    {
      id: 'post-103',
      attractionId: '6',
      userId: 'u3',
      username: 'HistoryBuff',
      content: 'Great restoration work. Very accessible with the cable car.',
      rating: 4,
      likes: 5,
      comments: [],
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      status: 'active'
    },
    {
      id: 'post-104',
      attractionId: '6',
      userId: 'u4',
      username: 'PandaFan',
      content: 'The toboggan ride down is a must-do! So much fun.',
      rating: 5,
      likes: 20,
      comments: [],
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      status: 'active'
    },
    {
      id: 'post-105',
      attractionId: '6',
      userId: 'u5',
      username: 'GlobalTrekker',
      content: 'A bit pricey for the cable car, but the wall itself is majestic.',
      rating: 4,
      likes: 3,
      comments: [],
      createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
      status: 'active'
    },
    {
      id: 'post-106',
      attractionId: '6',
      userId: 'u6',
      username: 'LocalGuide',
      content: 'Best time to visit is early morning to avoid tour groups.',
      rating: 5,
      likes: 15,
      comments: [],
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      status: 'active'
    }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    merchantId: 'm1',
    merchantName: 'Panda Souvenirs',
    attractionId: '1', // Linked to Panda Base
    attractionName: 'Chengdu Research Base of Giant Panda Breeding',
    name: 'Plush Panda Toy',
    description: 'Soft and cuddly panda plush.',
    price: 25.00,
    stock: 100,
    imageUrl: 'https://picsum.photos/400/400?random=10',
    imageUrls: ['https://picsum.photos/400/400?random=10']
  },
  {
    id: 'p2',
    merchantId: 'm1',
    merchantName: 'Panda Souvenirs',
    attractionId: '5', // Linked to Mt Qingcheng for variety
    attractionName: 'Mount Qingcheng',
    name: 'Bamboo Fan',
    description: 'Traditional hand fan made of bamboo.',
    price: 12.50,
    stock: 50,
    imageUrl: 'https://picsum.photos/400/400?random=11',
    imageUrls: ['https://picsum.photos/400/400?random=11']
  },
  {
    id: 'p3',
    merchantId: 'm1',
    merchantName: 'Panda Souvenirs',
    attractionId: '2', // Forbidden City
    attractionName: 'The Palace Museum (Forbidden City)',
    name: 'Imperial Ceramic Tea Set',
    description: 'A premium 5-piece ceramic tea set inspired by Qing Dynasty designs. Includes one teapot and four cups, packaged in a decorative gift box. The glaze features intricate blue and white patterns.',
    price: 88.00,
    stock: 15,
    imageUrl: 'https://picsum.photos/400/400?random=20',
    imageUrls: [
        'https://picsum.photos/400/400?random=20',
        'https://picsum.photos/400/400?random=21',
        'https://picsum.photos/400/400?random=22',
        'https://picsum.photos/400/400?random=23'
    ]
  }
];

// Seed some initial users if not present
const INITIAL_USERS: User[] = [
  { id: 'admin1', username: 'Admin User', email: 'admin@test.com', role: UserRole.ADMIN, status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=admin' },
  { id: 'm1', username: 'Merchant User', email: 'merchant@test.com', role: UserRole.MERCHANT, status: 'active', qualificationUrl: 'https://picsum.photos/200/300', qualificationUrls: ['https://picsum.photos/200/300'], avatarUrl: 'https://i.pravatar.cc/150?u=merchant' },
  { id: 'u1', username: 'Traveler User', email: 'user@test.com', role: UserRole.TRAVELER, status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=traveler' },
];

// --- INTERNAL HELPERS ---

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

// --- AUTH SERVICES ---

export const login = async (email: string, password: string): Promise<ApiResponse<User>> => {
  await delay(DELAY_MS);
  
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    return { success: true, data: { ...user, token: `mock-jwt-${user.id}` } };
  }
  
  return { success: false, message: 'Invalid credentials. Try user@test.com, merchant@test.com, or admin@test.com' };
};

export const register = async (userData: Partial<User>, password: string): Promise<ApiResponse<User>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);

  if (users.find(u => u.email === userData.email)) {
    return { success: false, message: 'Email already exists' };
  }

  // Merchants start as pending, others as active
  const status = userData.role === UserRole.MERCHANT ? 'pending' : 'active';
  
  // Handle multiple qualification URLs
  const qualificationUrls = userData.qualificationUrls || [];
  if (userData.qualificationUrl && qualificationUrls.length === 0) {
      qualificationUrls.push(userData.qualificationUrl);
  }

  const newUser: User = {
    id: `u-${Date.now()}`,
    username: userData.username || userData.email!.split('@')[0],
    email: userData.email!,
    role: userData.role || UserRole.TRAVELER,
    status: status,
    qualificationUrl: qualificationUrls[0], // Primary
    qualificationUrls: qualificationUrls,
    token: `mock-jwt-new`,
    avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}` // Default avatar
  };

  setStorage('mock_users', [...users, newUser]);
  return { success: true, data: newUser };
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return { success: false, message: 'User not found' };

  // Allow updating allowed fields. In a real app, email/role updates might be restricted or require verification.
  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  setStorage('mock_users', users);
  
  return { success: true, data: updatedUser };
};

export const getPendingMerchants = async (): Promise<ApiResponse<User[]>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  const pending = users.filter(u => u.role === UserRole.MERCHANT && u.status === 'pending');
  return { success: true, data: pending };
};

export const updateUserStatus = async (userId: string, status: 'active' | 'rejected'): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  const updatedUsers = users.map(u => u.id === userId ? { ...u, status } : u);
  setStorage('mock_users', updatedUsers);
  
  // NOTIFICATION
  createNotification(
    userId, 
    'Account Status Update', 
    `Your account application has been ${status}.`, 
    status === 'active' ? 'success' : 'error'
  );

  return { success: true, data: true };
};

// --- ATTRACTION SERVICES ---

interface AttractionFilters {
  province?: string;
  city?: string;
  county?: string;
  query?: string;
  tag?: string;
}

export const getAttractions = async (filters: AttractionFilters = {}): Promise<ApiResponse<Attraction[]>> => {
  await delay(DELAY_MS);
  // Use getStorage to ensure persistence for admin edits
  let data = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  // Ensure we have posts loaded, defaulting to the mock data if empty
  const posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  
  // Only return active attractions for the general list
  data = data.filter(a => a.status === 'active');

  if (filters.province) data = data.filter(a => a.province === filters.province);
  if (filters.city) data = data.filter(a => a.city === filters.city);
  if (filters.county) data = data.filter(a => a.county === filters.county);
  
  if (filters.tag) data = data.filter(a => a.tags.includes(filters.tag!));
  
  if (filters.query) {
    const q = filters.query.toLowerCase();
    data = data.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }

  // Calculate ratings for each attraction
  data = data.map(attr => {
    // Only count active posts with a rating
    const attrPosts = posts.filter(p => p.attractionId === attr.id && p.status === 'active' && typeof p.rating === 'number');
    const count = attrPosts.length;
    const totalRating = attrPosts.reduce((acc, p) => acc + (p.rating || 0), 0);
    const avg = count > 0 ? totalRating / count : 0;
    
    return {
      ...attr,
      reviewCount: count,
      averageRating: avg
    };
  });

  // Sort by Average Rating (High to Low), then by Review Count
  data.sort((a, b) => {
    const ratingA = a.averageRating || 0;
    const ratingB = b.averageRating || 0;
    if (ratingB !== ratingA) return ratingB - ratingA;
    return (b.reviewCount || 0) - (a.reviewCount || 0);
  });

  return { success: true, data };
};

export const getPendingAttractions = async (): Promise<ApiResponse<Attraction[]>> => {
  await delay(DELAY_MS);
  const data = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  const pending = data.filter(a => a.status === 'pending');
  return { success: true, data: pending };
};

export const getAttractionById = async (id: string): Promise<ApiResponse<Attraction>> => {
  await delay(DELAY_MS);
  const data = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  // Allow viewing pending attractions if accessed directly (e.g. by admin or creator), 
  // though in a real app this would be permission-gated.
  const attraction = data.find(a => a.id === id);

  if (attraction) {
    const posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
    const attrPosts = posts.filter(p => p.attractionId === attraction.id && p.status === 'active' && typeof p.rating === 'number');
    const count = attrPosts.length;
    const totalRating = attrPosts.reduce((acc, p) => acc + (p.rating || 0), 0);
    const avg = count > 0 ? totalRating / count : 0;
    
    return { success: true, data: { ...attraction, reviewCount: count, averageRating: avg } };
  }
  
  return { success: false, message: 'Not found' };
};

export const createAttraction = async (attractionData: Partial<Attraction>): Promise<ApiResponse<Attraction>> => {
    await delay(DELAY_MS);
    const attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
    
    // Default status is 'active' if not specified (e.g. created by Admin)
    // If created by User, it should be passed as 'pending'
    const status = attractionData.status || 'active';
    
    // Handle images
    const imageUrls = attractionData.imageUrls || [];
    if (attractionData.imageUrl && imageUrls.length === 0) imageUrls.push(attractionData.imageUrl);
    const primaryImage = imageUrls.length > 0 ? imageUrls[0] : 'https://picsum.photos/800/600?random=99';
    // Gallery excludes first image usually, or includes all. Let's make gallery = all for simplicity in UI, or slice.
    // Existing logic used gallery separate from imageUrl. Let's merge: imageUrl = [0], gallery = [1..n]
    const gallery = imageUrls.length > 1 ? imageUrls.slice(1) : [];

    const newAttraction: Attraction = {
        id: `attr-${Date.now()}`,
        title: attractionData.title!,
        description: attractionData.description!,
        address: attractionData.address!,
        province: attractionData.province!,
        city: attractionData.city!,
        county: attractionData.county!,
        region: `${attractionData.province} ${attractionData.city}`,
        tags: attractionData.tags || [],
        imageUrl: primaryImage,
        imageUrls: imageUrls,
        gallery: gallery,
        openHours: attractionData.openHours,
        drivingTips: attractionData.drivingTips,
        travelerTips: attractionData.travelerTips,
        status: status,
        submittedBy: attractionData.submittedBy,
        submittedById: attractionData.submittedById
    };
    setStorage('mock_attractions', [newAttraction, ...attractions]);
    return { success: true, data: newAttraction };
};

export const updateAttraction = async (id: string, updates: Partial<Attraction>): Promise<ApiResponse<Attraction>> => {
    await delay(DELAY_MS);
    const attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
    const index = attractions.findIndex(a => a.id === id);
    if (index === -1) return { success: false, message: 'Attraction not found' };
    
    const oldStatus = attractions[index].status;
    const updatedAttraction = { ...attractions[index], ...updates };
    
    // Sync images if imageUrls is updated
    if (updates.imageUrls) {
        updatedAttraction.imageUrl = updates.imageUrls[0];
        updatedAttraction.gallery = updates.imageUrls.slice(1);
    }

    attractions[index] = updatedAttraction;
    setStorage('mock_attractions', attractions);
    
    // NOTIFICATION
    if (updatedAttraction.submittedById && oldStatus !== updatedAttraction.status) {
        createNotification(
            updatedAttraction.submittedById, 
            'Attraction Status Update', 
            `Your attraction "${updatedAttraction.title}" has been ${updatedAttraction.status}.`, 
            updatedAttraction.status === 'active' ? 'success' : 'error'
        );
    }

    return { success: true, data: updatedAttraction };
};

export const deleteAttraction = async (id: string): Promise<ApiResponse<boolean>> => {
    await delay(DELAY_MS);
    let attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
    const target = attractions.find(a => a.id === id);
    if (target && target.submittedById) {
        createNotification(target.submittedById, 'Attraction Rejected', `Your attraction "${target.title}" was rejected and removed.`, 'error');
    }
    
    attractions = attractions.filter(a => a.id !== id);
    setStorage('mock_attractions', attractions);
    return { success: true, data: true };
};


// --- POST SERVICES ---

export const getPosts = async (attractionId?: string): Promise<ApiResponse<Post[]>> => {
  await delay(DELAY_MS);
  const allPosts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  
  // Filter out reported posts for public view. 
  // Reported posts are only visible to Admins via getReportedContent.
  const visiblePosts = allPosts.filter(p => p.status === 'active');
  
  const filtered = attractionId ? visiblePosts.filter(p => p.attractionId === attractionId) : visiblePosts;
  return { success: true, data: filtered };
};

export const createPost = async (postData: Partial<Post>): Promise<ApiResponse<Post>> => {
  await delay(DELAY_MS);
  
  const imageUrls = postData.imageUrls || [];
  if (postData.imageUrl && imageUrls.length === 0) imageUrls.push(postData.imageUrl);

  const newPost: Post = {
    id: `post-${Date.now()}`,
    attractionId: postData.attractionId!,
    userId: postData.userId!,
    username: postData.username!,
    content: postData.content!,
    imageUrl: imageUrls[0], // Legacy support
    imageUrls: imageUrls,
    rating: postData.rating,
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
  
  // Update legacy field if image urls change
  if (updates.imageUrls) {
      updatedPost.imageUrl = updates.imageUrls.length > 0 ? updates.imageUrls[0] : undefined;
  }

  posts[index] = updatedPost;
  setStorage('mock_posts', posts);
  return { success: true, data: updatedPost };
};

export const deletePost = async (id: string): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  let posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  posts = posts.filter(p => p.id !== id);
  setStorage('mock_posts', posts);
  return { success: true, data: true };
};

export const reportPost = async (postId: string, reporterId?: string): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  // Updates status to 'reported', which removes it from getPosts() view but adds it to getReportedContent()
  const posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  const updated = posts.map(p => p.id === postId ? { ...p, status: 'reported' as const } : p);
  setStorage('mock_posts', updated);
  
  if (reporterId) {
    const reports = getStorage<Record<string, string[]>>('mock_reports', {});
    const existing = reports[postId] || [];
    if (!existing.includes(reporterId)) {
        reports[postId] = [...existing, reporterId];
        setStorage('mock_reports', reports);
    }
  }

  return { success: true, data: true };
};

// --- MERCHANT & PRODUCT SERVICES ---

export interface ProductFilters {
  merchantId?: string;
  attractionId?: string;
  query?: string;
  province?: string;
  city?: string;
  county?: string;
}

export const getProducts = async (filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> => {
  await delay(DELAY_MS);
  let allProducts = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  const attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  
  if (filters.merchantId) allProducts = allProducts.filter(p => p.merchantId === filters.merchantId);
  if (filters.attractionId) allProducts = allProducts.filter(p => p.attractionId === filters.attractionId);
  
  // Region filtering: Find attractions in the region, then filter products linked to them
  if (filters.province || filters.city || filters.county) {
      const validAttractionIds = attractions.filter(a => {
          if (filters.province && a.province !== filters.province) return false;
          if (filters.city && a.city !== filters.city) return false;
          if (filters.county && a.county !== filters.county) return false;
          return true;
      }).map(a => a.id);

      // Only show products linked to attractions in that region
      allProducts = allProducts.filter(p => p.attractionId && validAttractionIds.includes(p.attractionId));
  }

  // Search query
  if (filters.query) {
    const q = filters.query.toLowerCase();
    allProducts = allProducts.filter(p => 
       p.name.toLowerCase().includes(q) || 
       p.description.toLowerCase().includes(q) ||
       (p.attractionName && p.attractionName.toLowerCase().includes(q))
    );
  }
  
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

  // Auto-populate attraction name if ID is provided
  let attractionName = undefined;
  if (product.attractionId) {
      const attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
      const attr = attractions.find(a => a.id === product.attractionId);
      if (attr) attractionName = attr.title;
  }

  const imageUrls = product.imageUrls || [];
  if (product.imageUrl && imageUrls.length === 0) imageUrls.push(product.imageUrl);
  const primaryImage = imageUrls.length > 0 ? imageUrls[0] : `https://picsum.photos/400/400?random=${Date.now()}`;

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    merchantId: product.merchantId!,
    merchantName: product.merchantName || 'My Store',
    attractionId: product.attractionId,
    attractionName: attractionName,
    name: product.name!,
    description: product.description!,
    price: product.price!,
    stock: product.stock!,
    imageUrl: primaryImage,
    imageUrls: imageUrls
  };
  const products = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  setStorage('mock_products', [...products, newProduct]);
  return { success: true, data: newProduct };
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> => {
  await delay(DELAY_MS);
  const products = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return { success: false, message: 'Product not found' };

  const existingProduct = products[index];
  const updatedProduct = { ...existingProduct, ...updates };

  // Sync primary image if imageUrls changed
  if (updates.imageUrls) {
      if (updates.imageUrls.length > 0) {
          updatedProduct.imageUrl = updates.imageUrls[0];
      } else {
          updatedProduct.imageUrl = 'https://picsum.photos/400/400';
      }
  }

  // Update attractionName if attractionId changed
  if (updates.attractionId !== undefined && updates.attractionId !== existingProduct.attractionId) {
      if (updates.attractionId === '' || updates.attractionId === null) {
          updatedProduct.attractionId = undefined;
          updatedProduct.attractionName = undefined;
      } else {
          const attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
          const attr = attractions.find(a => a.id === updates.attractionId);
          updatedProduct.attractionName = attr ? attr.title : undefined;
      }
  }

  products[index] = updatedProduct;
  setStorage('mock_products', products);
  return { success: true, data: updatedProduct };
};

export const deleteProduct = async (id: string): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  let products = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  products = products.filter(p => p.id !== id);
  setStorage('mock_products', products);
  return { success: true, data: true };
};

// --- ORDER SERVICES ---

export const createOrder = async (orderData: Partial<Order>): Promise<ApiResponse<Order>> => {
  await delay(DELAY_MS);
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    userId: orderData.userId!,
    items: orderData.items!,
    total: orderData.total!,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  const orders = getStorage<Order[]>('mock_orders', []);
  setStorage('mock_orders', [newOrder, ...orders]);
  
  // NOTIFICATION: Notify Merchant(s)
  // Get unique merchant IDs
  const merchantIds = Array.from(new Set(newOrder.items.map(i => i.merchantId)));
  merchantIds.forEach(mId => {
      createNotification(mId, 'New Order Received', `You have a new order (ID: ${newOrder.id}) for $${newOrder.total}.`, 'success');
  });

  return { success: true, data: newOrder };
};

export const getOrders = async (userId?: string, merchantId?: string): Promise<ApiResponse<Order[]>> => {
  await delay(DELAY_MS);
  let orders = getStorage<Order[]>('mock_orders', []);
  if (userId) orders = orders.filter(o => o.userId === userId);
  if (merchantId) {
    orders = orders.filter(o => o.items.some(i => i.merchantId === merchantId));
  }
  return { success: true, data: orders };
};

export const updateOrderStatus = async (orderId: string, status: Order['status'], trackingNumber?: string): Promise<ApiResponse<Order>> => {
  await delay(DELAY_MS);
  const orders = getStorage<Order[]>('mock_orders', []);
  let updatedOrder: Order | null = null;
  
  const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
          updatedOrder = { ...o, status, trackingNumber: trackingNumber || o.trackingNumber };
          return updatedOrder;
      }
      return o;
  });
  
  if (!updatedOrder) return { success: false, message: 'Order not found' };
  setStorage('mock_orders', updatedOrders);
  
  // NOTIFICATION: Notify Buyer
  if (updatedOrder) {
      const o = updatedOrder as Order;
      createNotification(o.userId, 'Order Status Update', `Your order #${o.id.slice(-6)} is now ${status}.`, 'info');
  }

  return { success: true, data: updatedOrder };
};

// --- ADMIN SERVICES ---

export const getReportedContent = async (): Promise<ApiResponse<Post[]>> => {
  await delay(DELAY_MS);
  // Fetch raw posts to find 'reported' ones, as getPosts() filters them out
  const posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  return { success: true, data: posts.filter(p => p.status === 'reported') };
};

export const moderateContent = async (id: string, action: 'approve' | 'delete'): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  let posts = getStorage<Post[]>('mock_posts', MOCK_POSTS);
  const post = posts.find(p => p.id === id);

  if (action === 'delete') {
    posts = posts.filter(p => p.id !== id);
  } else {
    // Approve means ignoring the report and setting it back to active
    posts = posts.map(p => p.id === id ? { ...p, status: 'active' as const } : p);
  }
  setStorage('mock_posts', posts);

  // NOTIFICATION
  if (post) {
      // 1. Notify Author
      createNotification(
          post.userId, 
          'Content Moderation', 
          `Your review on attraction ${post.attractionId} has been ${action === 'delete' ? 'removed due to violations' : 'approved and restored'}.`,
          action === 'delete' ? 'error' : 'success'
      );
      
      // 2. Notify Reporters
      const reports = getStorage<Record<string, string[]>>('mock_reports', {});
      const reporterIds = reports[id] || [];
      reporterIds.forEach(uid => {
          createNotification(uid, 'Report Update', `A review you reported has been ${action === 'delete' ? 'removed' : 'reviewed and kept'}.`, 'info');
      });
  }

  return { success: true, data: true };
};

// --- NOTIFICATION SERVICES ---

export const getMessages = async (userId: string): Promise<ApiResponse<NotificationMessage[]>> => {
  // Simulate delay occasionally or fast
  // await delay(200); 
  const msgs = getStorage<NotificationMessage[]>('mock_notifications', []);
  const myMsgs = msgs.filter(m => m.userId === userId);
  return { success: true, data: myMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
};

export const markMessageRead = async (messageId: string): Promise<ApiResponse<boolean>> => {
  const msgs = getStorage<NotificationMessage[]>('mock_notifications', []);
  const updated = msgs.map(m => m.id === messageId ? { ...m, isRead: true } : m);
  setStorage('mock_notifications', updated);
  return { success: true, data: true };
};

export const markAllMessagesRead = async (userId: string): Promise<ApiResponse<boolean>> => {
    const msgs = getStorage<NotificationMessage[]>('mock_notifications', []);
    const updated = msgs.map(m => m.userId === userId ? { ...m, isRead: true } : m);
    setStorage('mock_notifications', updated);
    return { success: true, data: true };
};

export const uploadFile = async (file: File): Promise<string> => {
    // Return Base64 to persist images in LocalStorage for the demo
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}