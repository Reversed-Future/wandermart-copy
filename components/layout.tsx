import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import { Icons, Button, Input, Card, ImageUploader, Badge } from './ui';
import { UserRole, NotificationMessage } from '../types';
import * as API from '../services/api';

const ProfileModal = ({ onClose }: { onClose: () => void }) => {
    const { user, updateProfile } = useAuth();
    const { notify } = useNotification();
    const [formData, setFormData] = useState({ 
        username: user?.username || '', 
        email: user?.email || '',
    });
    const [avatars, setAvatars] = useState<string[]>(user?.avatarUrl ? [user.avatarUrl] : []);
    const [isSaving, setIsSaving] = useState(false);

    if (!user) return null;

    const handleSave = async () => {
        setIsSaving(true);
        const avatarUrl = avatars.length > 0 ? avatars[0] : undefined;
        const res = await API.updateUser(user.id, { 
            username: formData.username, 
            email: formData.email,
            avatarUrl 
        });
        
        if (res.success && res.data) {
            updateProfile(res.data);
            notify("Profile updated successfully", "success");
            onClose();
        } else {
            notify(res.message || "Failed to update profile", "error");
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
            <Card className="max-w-md w-full mx-4 p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><Icons.X /></button>
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                
                <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <ImageUploader 
                                images={avatars}
                                onChange={setAvatars}
                                maxCount={1}
                                label=""
                            />
                            {avatars.length === 0 && (
                                <div className="absolute top-0 left-0 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 pointer-events-none">
                                    <Icons.User />
                                </div>
                            )}
                        </div>
                    </div>

                    <Input label="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    <Input label="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />

                    {user.role === UserRole.MERCHANT && (
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <h4 className="font-bold text-gray-700 mb-2 text-sm">Merchant Verification Status</h4>
                             <div className="flex justify-between items-center">
                                 <span className="text-sm text-gray-600">License Audit:</span>
                                 <Badge color={user.status === 'active' ? 'green' : user.status === 'rejected' ? 'red' : 'yellow'}>
                                     {user.status.toUpperCase()}
                                 </Badge>
                             </div>
                             {user.status === 'rejected' && <p className="text-xs text-red-500 mt-2">Your application was rejected. Please contact support.</p>}
                         </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// --- Notification Dropdown Component ---
const NotificationCenter = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<NotificationMessage[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Poll for messages
    const fetchMessages = async () => {
        if (!user) return;
        const res = await API.getMessages(user.id);
        if (res.data) setMessages(res.data);
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [user]);

    const handleMarkRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await API.markMessageRead(id);
        setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
    };

    const handleMarkAllRead = async () => {
        if (!user) return;
        await API.markAllMessagesRead(user.id);
        setMessages(messages.map(m => ({ ...m, isRead: true })));
    };

    const unreadCount = messages.filter(m => !m.isRead).length;

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Icons.Bell />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                No notifications yet.
                            </div>
                        ) : (
                            <div>
                                {messages.map(msg => (
                                    <div 
                                        key={msg.id} 
                                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!msg.isRead ? 'bg-blue-50/50' : ''}`}
                                        onClick={(e) => !msg.isRead && handleMarkRead(msg.id, e)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-sm font-semibold ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{msg.title}</span>
                                            {!msg.isRead && <span className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2 mb-1">{msg.content}</p>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-500';

  // Only Guests and Travelers see shopping features
  const showShoppingFeatures = !user || user.role === UserRole.TRAVELER;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">WanderMart</Link>
              <nav className="hidden md:ml-8 md:flex space-x-6">
                <Link to="/" className={isActive('/')}>Explore</Link>
                <Link to="/products" className={isActive('/products')}>Marketplace</Link>
                
                {user?.role === UserRole.MERCHANT && (
                  <Link to="/merchant" className={isActive('/merchant')}>Store Dashboard</Link>
                )}
                {user?.role === UserRole.ADMIN && (
                   <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
                )}
                {showShoppingFeatures && user && (
                   <Link to="/orders" className={isActive('/orders')}>My Orders</Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Center */}
              {user && <NotificationCenter />}

              {showShoppingFeatures && (
                <Link to="/cart" className="relative text-gray-600 hover:text-blue-600">
                  <Icons.ShoppingBag />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="hidden md:flex items-center gap-4">
                  <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                      onClick={() => setIsProfileOpen(true)}
                  >
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-800 leading-tight">{user.username}</span>
                        <span className="text-xs text-gray-500 capitalize leading-tight">{user.role}</span>
                    </div>
                    <div className="h-9 w-9">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border border-gray-200" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Icons.User />
                            </div>
                        )}
                    </div>
                  </div>
                  <Button variant="secondary" onClick={handleLogout} className="text-sm">Logout</Button>
                </div>
              ) : (
                <div className="hidden md:flex gap-2">
                  <Link to="/login"><Button variant="ghost">Login</Button></Link>
                  <Link to="/register"><Button>Sign Up</Button></Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-600 p-2">
                <Icons.Menu />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
             <Link to="/" className="block text-gray-700" onClick={() => setIsMenuOpen(false)}>Explore</Link>
             <Link to="/products" className="block text-gray-700" onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
             {user?.role === UserRole.MERCHANT && <Link to="/merchant" className="block text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>Store Dashboard</Link>}
             {user?.role === UserRole.ADMIN && <Link to="/admin" className="block text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>}
             {showShoppingFeatures && user && <Link to="/orders" className="block text-gray-700" onClick={() => setIsMenuOpen(false)}>My Orders</Link>}
             
             {user && (
                 <div className="py-2 border-t border-b border-gray-100 my-2">
                     <button onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full text-left py-2">
                         {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                         ) : (
                            <div className="bg-blue-100 p-1 rounded-full"><Icons.User /></div>
                         )}
                         <div>
                             <div className="font-medium">{user.username}</div>
                             <div className="text-xs text-gray-500">Edit Profile</div>
                         </div>
                     </button>
                 </div>
             )}

             <div className="pt-2 flex flex-col gap-2">
               {!user ? (
                 <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-2 border rounded">Login</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-2 bg-blue-600 text-white rounded">Sign Up</Link>
                 </>
               ) : (
                 <Button variant="secondary" onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full">Logout</Button>
               )}
             </div>
          </div>
        )}
      </header>
      
      {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} WanderMart. All rights reserved.</p>
      </footer>
    </div>
  );
};