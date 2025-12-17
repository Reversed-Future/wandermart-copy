import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../components/ui';
import * as API from '../services/api';
import { Order } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) API.getOrders(user.id).then(res => res.data && setOrders(res.data));
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Order History</h1>
      <div className="space-y-4">
        {orders.map(o => (
          <Card key={o.id} className="p-4">
            <div className="flex justify-between mb-2 border-b pb-2">
              <span className="font-bold">Order #{o.id}</span>
              <Badge>{o.status}</Badge>
            </div>
            <div className="space-y-1">
              {o.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t">
              <div className="text-sm">
                {o.trackingNumber && <span className="text-gray-600">Tracking: <span className="font-mono font-bold">{o.trackingNumber}</span></span>}
              </div>
              <div className="font-bold text-right text-blue-600">
                Total: ${o.total.toFixed(2)}
              </div>
            </div>
          </Card>
        ))}
         {orders.length === 0 && <p className="text-gray-500">You haven't placed any orders yet.</p>}
      </div>
    </div>
  );
};