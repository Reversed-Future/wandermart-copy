import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import { Icons, Button, Input, Card, ImageUploader, Badge, Textarea } from './ui';
import { UserRole, NotificationMessage } from '../types';
import * as API from '../services/api';

const ApiModeSwitcher = () => {
    const currentMode = API.getApiMode();
    const [mode, setMode] = useState<'mock' | 'real'>(currentMode);
    
    const toggleMode = () => {
        const newMode = mode === 'mock' ? 'real' : 'mock';
        API.setApiMode(newMode);
        setMode(newMode);
        window.location.reload();
    };

    return (
        <div className="fixed bottom-4 left-4 z-[9999] group">
            <button 
                onClick={toggleMode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all border-2 ${
                    mode === 'mock' 
                    ? 'bg-blue-600 text-white border-blue-400' 
                    : 'bg-green-600 text-white border-green-400'
                }`}
            >
                <div className={`w-2 h-2 rounded-full animate-pulse ${mode === 'mock' ? 'bg-blue-200' : 'bg-green-200'}`}></div>
                <span>Mode: {mode.toUpperCase()}</span>
                <span className="hidden group-hover:inline-block ml-2 opacity-75 border-l border-white/30 pl-2">Switch</span>
            </button>
        </div>
    );
};

const ProfileModal = ({ onClose }: { onClose: () => void }) => {
    const { user, updateProfile } = useAuth();
    const { notify } = useNotification();
    const [formData, setFormData] = useState({ 
        username: user?.username || '', 
        email: user?.email || '',
        address: user?.address || '',
        phone: user?.phone || '',
        realName: user?.realName || ''
    });
    const [avatars, setAvatars] = useState<string[]>(user?.avatarUrl ? [user.avatarUrl] : []);
    const [isSaving, setIsSaving] = useState(false);

    if (!user) return null;

    const handleSave = async () => {
        setIsSaving(true);
        const avatarUrl = avatars.length > 0 ? avatars[0] : undefined;
        const res = await API.updateUser(user.id, { 
            ...formData,
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <Card className="max-w-md w-full mx-4 p-6 relative animate-scale-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><Icons.X /></button>
                <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="flex justify-center mb-6">
                        <ImageUploader 
                            images={avatars}
                            onChange={setAvatars}
                            maxCount={1}
                            label="Profile Photo"
                        />
                    </div>

                    <Input label="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    <Input label="Real Name (For Orders)" value={formData.realName} onChange={e => setFormData({...formData, realName: e.target.value})} />
                    <Input label="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    
                    {user.role === UserRole.TRAVELER && (
                        <Textarea 
                            label="Default Shipping Address" 
                            placeholder="Detailed address for deliveries..."
                            value={formData.address} 
                            onChange={e => setFormData({...formData, address: e.target.value})} 
                        />
                    )}

                    {user.role === UserRole.MERCHANT && (
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <h4 className="font-bold text-gray-700 mb-2 text-sm">Merchant Status</h4>
                             <Badge color={user.status === 'active' ? 'green' : 'yellow'}>{user.status.toUpperCase()}</Badge>
                         </div>
                    )}

                    <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const NotificationCenter = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<NotificationMessage[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchMessages = async () => {
        if (!user) return;
        const res = await API.getMessages(user.id);
        if (res.data) setMessages(res.data);
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const handleMarkRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await API.markMessageRead(id);
        setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
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
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">No new messages.</div>
                        ) : (
                            <div>
                                {messages.map(msg => (
                                    <div 
                                        key={msg.id} 
                                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!msg.isRead ? 'bg-blue-50/50' : ''}`}
                                        onClick={(e) => !msg.isRead && handleMarkRead(msg.id, e)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-semibold">{msg.title}</span>
                                            {!msg.isRead && <span className="h-2 w-2 bg-blue-500 rounded-full mt-1.5"></span>}
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2">{msg.content}</p>
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
                {user?.role === UserRole.MERCHANT && <Link to="/merchant" className={isActive('/merchant')}>Store Dashboard</Link>}
                {user?.role === UserRole.ADMIN && <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>}
                {showShoppingFeatures && user && <Link to="/orders" className={isActive('/orders')}>My Orders</Link>}
              </nav>
            </div>

            <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                    <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">{user.username}</div>
                        <div className="text-[10px] text-gray-500 uppercase">{user.role}</div>
                    </div>
                    <div className="h-9 w-9">
                        {user.avatarUrl ? <img src={user.avatarUrl} alt="A" className="w-full h-full rounded-full object-cover border border-gray-200" /> : <div className="bg-blue-100 p-2 rounded-full"><Icons.User /></div>}
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
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-600"><Icons.Menu /></button>
            </div>
          </div>
        </div>
      </header>
      
      {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500"><p>&copy; {new Date().getFullYear()} WanderMart. All rights reserved.</p></footer>
      <ApiModeSwitcher />
    </div>
  );
};