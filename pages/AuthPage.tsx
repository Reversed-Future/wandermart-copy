import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card, Alert, ImageUploader } from '../components/ui';
import * as API from '../services/api';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const AuthPage: React.FC<{ type: 'login' | 'register' }> = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(UserRole.TRAVELER); // Only for register
  const [qualificationUrls, setQualificationUrls] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let res;
      if (type === 'login') {
        res = await API.login(email, password);
      } else {
        if (role === UserRole.MERCHANT && qualificationUrls.length === 0) {
            setError('Merchants must upload at least one qualification document.');
            setLoading(false);
            return;
        }

        res = await API.register({ 
            email, 
            username: email.split('@')[0], 
            role, 
            qualificationUrls: qualificationUrls
        }, password);
      }

      if (res.success && res.data) {
        login(res.data);
        navigate('/');
      } else {
        setError(res.message || 'An error occurred');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{type === 'login' ? 'Welcome Back' : 'Join WanderMart'}</h1>
        {error && <Alert>{error}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {type === 'register' && (
             <div className="mb-4 space-y-4">
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                   <select className="w-full border border-gray-300 rounded px-3 py-2" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                     <option value={UserRole.TRAVELER}>Traveler</option>
                     <option value={UserRole.MERCHANT}>Merchant</option>
                   </select>
               </div>
               
               {role === UserRole.MERCHANT && (
                 <div>
                    <ImageUploader 
                      images={qualificationUrls}
                      onChange={setQualificationUrls}
                      label="Business License / Qualifications"
                      maxCount={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload images of your business license for approval.</p>
                 </div>
               )}
             </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>{type === 'login' ? 'Login' : 'Sign Up'}</Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          {type === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Link to={type === 'login' ? '/register' : '/login'} className="text-blue-600 font-medium">
            {type === 'login' ? 'Sign up' : 'Login'}
          </Link>
        </div>
        
        {type === 'login' && (
          <div className="mt-6 p-4 bg-gray-50 text-xs text-gray-500 rounded border border-gray-200">
            <p className="font-bold mb-1">Demo Credentials:</p>
            <p>Admin: admin@test.com</p>
            <p>Merchant: merchant@test.com (Active)</p>
            <p>Traveler: user@test.com</p>
            <p>Pass: any</p>
          </div>
        )}
      </Card>
    </div>
  );
};