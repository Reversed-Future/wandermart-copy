import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge, Alert, ImageUploader, Textarea, Icons } from '../components/ui';
import * as API from '../services/api';
import { User, Attraction, Post } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { REGION_DATA } from '../data/china_regions';

const uniqueTags = Array.from(new Set([
  'Nature', 'Hiking', 'Water', 
  'History', 'Culture', 'Shopping', 
  'Ocean', 'Mountain', 'Animals', 'Architecture', 'Family'
])).sort();

export const AdminDashboard = () => {
  const [reports, setReports] = useState<Post[]>([]);
  const [pendingMerchants, setPendingMerchants] = useState<User[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [pendingAttractions, setPendingAttractions] = useState<Attraction[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'attractions' | 'approvals'>('content');
  const { notify, confirm } = useNotification();

  // Attraction Form State
  const [editingAttr, setEditingAttr] = useState<Partial<Attraction> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingImages, setEditingImages] = useState<string[]>([]);

  const refreshData = async () => {
      const [repRes, mercRes, attrRes, pendAttrRes] = await Promise.all([
          API.getReportedContent(),
          API.getPendingMerchants(),
          API.getAttractions({}),
          API.getPendingAttractions()
      ]);

      if (repRes.data) setReports(repRes.data);
      if (mercRes.data) setPendingMerchants(mercRes.data);
      if (attrRes.data) setAttractions(attrRes.data);
      if (pendAttrRes.data) setPendingAttractions(pendAttrRes.data);

      // Simple alert if unauthorized access (mock server guard)
      if (repRes.success === false && repRes.message?.includes('Forbidden')) {
          notify("Access denied: You are not authorized for administrative tasks.", "error");
      }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleModeration = async (id: string, action: 'approve' | 'delete') => {
    const res = await API.moderateContent(id, action);
    if (res.success) {
        setReports(reports.filter(r => r.id !== id));
        notify(action === 'delete' ? "Post deleted" : "Post approved", "success");
    } else {
        notify(res.message || "Action failed", "error");
    }
  };

  const handleMerchantApproval = async (id: string, status: 'active' | 'rejected') => {
      const res = await API.updateUserStatus(id, status);
      if (res.success) {
          setPendingMerchants(pendingMerchants.filter(u => u.id !== id));
          notify(`User ${status === 'active' ? 'Approved' : 'Rejected'}`, status === 'active' ? "success" : "info");
      } else {
          notify(res.message || "Action failed", "error");
      }
  };

  const handleAttractionApproval = async (id: string, action: 'approve' | 'reject') => {
      if (action === 'approve') {
          const res = await API.updateAttraction(id, { status: 'active' });
          if (res.success && res.data) {
              setPendingAttractions(pendingAttractions.filter(a => a.id !== id));
              setAttractions([...attractions, res.data]);
              notify("Attraction approved and published", "success");
          } else {
              notify(res.message || "Failed to approve", "error");
          }
      } else {
          confirm("Reject this attraction submission? It will be deleted.", async () => {
              const res = await API.deleteAttraction(id);
              if (res.success) {
                  setPendingAttractions(pendingAttractions.filter(a => a.id !== id));
                  notify("Submission rejected", "info");
              } else {
                  notify(res.message || "Failed to delete", "error");
              }
          });
      }
      
      if (editingAttr?.id === id) {
          setIsEditing(false);
          setEditingAttr(null);
          setEditingImages([]);
      }
  };

  const handleSaveAttraction = async (targetStatus?: 'active') => {
      if (!editingAttr) return;
      
      if (!editingAttr.title || !editingAttr.description || !editingAttr.province || !editingAttr.city || !editingAttr.county) {
          notify("Please fill in all required fields.", "error");
          return;
      }

      const payload = { 
          ...editingAttr, 
          imageUrl: editingImages.length > 0 ? editingImages[0] : (editingAttr.imageUrl || ''),
          imageUrls: editingImages 
      };
      if (targetStatus) payload.status = targetStatus;

      let res;
      if (editingAttr.id) {
          res = await API.updateAttraction(editingAttr.id, payload);
      } else {
          res = await API.createAttraction(payload);
      }

      if (res.success) {
          notify("Attraction saved successfully", "success");
          setIsEditing(false);
          setEditingAttr(null);
          setEditingImages([]);
          refreshData();
      } else {
          notify(res.message || "Save failed", "error");
      }
  };

  const handleDeleteAttraction = (id: string) => {
      confirm("Are you sure? This cannot be undone.", async () => {
          const res = await API.deleteAttraction(id);
          if (res.success) {
            setAttractions(attractions.filter(a => a.id !== id));
            notify("Attraction deleted", "info");
          } else {
            notify(res.message || "Delete failed", "error");
          }
      });
  };

  const openEdit = (attr?: Attraction) => {
      setEditingAttr(attr || { title: '', description: '', address: '', province: '', city: '', county: '', tags: [], openHours: '', drivingTips: '', travelerTips: '' });
      setEditingImages(attr?.imageUrls || (attr?.imageUrl ? [attr.imageUrl] : []));
      setIsEditing(true);
      setTimeout(() => {
          document.getElementById('edit-form-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="flex gap-4 mb-6 border-b overflow-x-auto">
          <button 
            className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'content' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('content')}
          >
              Content Moderation
          </button>
          <button 
            className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('users')}
          >
              Merchant Approvals ({pendingMerchants.length})
          </button>
          <button 
            className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'approvals' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('approvals')}
          >
              Attraction Approvals ({pendingAttractions.length})
          </button>
          <button 
            className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'attractions' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('attractions')}
          >
              All Attractions
          </button>
      </div>

      {activeTab === 'content' && (
        <div className="animate-fade-in">
          {reports.length === 0 ? <Alert type="success">All caught up! No reported content.</Alert> : (
            <div className="space-y-4">
              {reports.map(post => (
                <Card key={post.id} className="p-4">
                   <div className="flex justify-between">
                     <h3 className="font-bold">Reported Post</h3>
                     <span className="text-sm text-gray-500">By {post.username}</span>
                   </div>
                   <p className="my-3 bg-gray-50 p-2 rounded">{post.content}</p>
                   {post.imageUrls && post.imageUrls.length > 0 && (
                     <div className="mb-3 flex gap-2">
                        {post.imageUrls.map((url, i) => (
                             <img key={i} src={url} alt="Reported content" className="h-20 w-20 object-cover rounded border" />
                        ))}
                     </div>
                   )}
                   <div className="flex gap-2">
                     <Button variant="danger" onClick={() => handleModeration(post.id, 'delete')} className="text-sm">Delete</Button>
                     <Button variant="secondary" onClick={() => handleModeration(post.id, 'approve')} className="text-sm">Approve (Ignore Report)</Button>
                   </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
          <div className="animate-fade-in">
              {pendingMerchants.length === 0 ? <Alert type="success">No pending merchant applications.</Alert> : (
                  <div className="grid gap-6">
                      {pendingMerchants.map(user => (
                          <Card key={user.id} className="p-6">
                              <div className="flex flex-col md:flex-row gap-6">
                                  {user.qualificationUrls && (
                                      <div className="w-full md:w-1/3 flex flex-wrap gap-2">
                                          {user.qualificationUrls.map((url, idx) => (
                                              <a key={idx} href={url} target="_blank" rel="noreferrer">
                                                <img src={url} alt="License" className="w-24 h-24 object-cover rounded border hover:opacity-90" />
                                              </a>
                                          ))}
                                      </div>
                                  )}
                                  <div className="flex-grow">
                                      <h3 className="text-xl font-bold">{user.username}</h3>
                                      <p className="text-gray-600 mb-2">{user.email}</p>
                                      <Badge color="yellow">Pending Approval</Badge>
                                      
                                      <div className="mt-6 flex gap-3">
                                          <Button onClick={() => handleMerchantApproval(user.id, 'active')} className="bg-green-600 hover:bg-green-700">Approve Merchant</Button>
                                          <Button onClick={() => handleMerchantApproval(user.id, 'rejected')} variant="danger">Reject Application</Button>
                                      </div>
                                  </div>
                              </div>
                          </Card>
                      ))}
                  </div>
              )}
          </div>
      )}

      {activeTab === 'approvals' && (
          <div className="animate-fade-in">
              {pendingAttractions.length === 0 ? <Alert type="success">No pending attraction submissions.</Alert> : (
                  <div className="grid grid-cols-1 gap-6">
                      {pendingAttractions.map(attr => (
                          <Card key={attr.id} className="p-4 flex flex-col md:flex-row gap-4">
                              <img src={attr.imageUrl} className="w-full md:w-48 h-32 object-cover rounded" alt={attr.title} />
                              <div className="flex-grow">
                                  <div className="flex justify-between items-start">
                                      <h3 className="font-bold text-lg">{attr.title}</h3>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Submitted by: {attr.submittedBy || 'Unknown'}</span>
                                  </div>
                                  <div className="text-sm text-gray-500 mb-2">{attr.province} {attr.city} {attr.county}</div>
                                  <p className="text-sm text-gray-700 mb-3">{attr.description}</p>
                                  <div className="flex flex-wrap gap-2">
                                      <Button className="text-sm py-1" variant="secondary" onClick={() => openEdit(attr)}><Icons.Search /> Review / Edit</Button>
                                      <Button className="text-sm py-1 bg-green-600 hover:bg-green-700" onClick={() => handleAttractionApproval(attr.id, 'approve')}>Approve</Button>
                                      <Button variant="danger" className="text-sm py-1" onClick={() => handleAttractionApproval(attr.id, 'reject')}>Reject</Button>
                                  </div>
                              </div>
                          </Card>
                      ))}
                  </div>
              )}
          </div>
      )}

      {(activeTab === 'attractions' || isEditing) && (
          <div id="edit-form-anchor" className="animate-fade-in">
              {isEditing ? (
                  <Card className="p-6 bg-gray-50 mt-6 border-2 border-blue-100">
                      <h3 className="font-bold mb-4 flex items-center gap-2 text-xl">
                          {editingAttr?.id ? 'Edit Attraction' : 'New Attraction'}
                          {editingAttr?.status === 'pending' && <Badge color="yellow">Pending Submission</Badge>}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                          <Input label="Title *" value={editingAttr?.title} onChange={e => setEditingAttr({...editingAttr, title: e.target.value})} />
                          <Input label="Address *" value={editingAttr?.address} onChange={e => setEditingAttr({...editingAttr, address: e.target.value})} />
                          
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                              <select className="w-full border border-gray-300 rounded px-3 py-2" value={editingAttr?.province || ''} onChange={e => setEditingAttr({...editingAttr, province: e.target.value, city: '', county: ''})}>
                                  <option value="">Select Province</option>
                                  {Object.keys(REGION_DATA).map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                              <select className="w-full border border-gray-300 rounded px-3 py-2" value={editingAttr?.city || ''} onChange={e => setEditingAttr({...editingAttr, city: e.target.value, county: ''})} disabled={!editingAttr?.province}>
                                  <option value="">Select City</option>
                                  {editingAttr?.province && Object.keys(REGION_DATA[editingAttr.province]).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                          </div>
                          <div className="md:col-span-2">
                             <ImageUploader images={editingImages} onChange={setEditingImages} label="Photos" />
                          </div>
                          <div className="md:col-span-2">
                             <Textarea label="Description *" value={editingAttr?.description} onChange={e => setEditingAttr({...editingAttr, description: e.target.value})} />
                          </div>
                      </div>
                      <div className="mt-6 flex gap-3 pt-4 border-t">
                          <Button onClick={() => handleSaveAttraction()}>Save</Button>
                          {editingAttr?.status === 'pending' && <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSaveAttraction('active')}>Approve & Publish</Button>}
                          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                  </Card>
              ) : (
                  <div className="mt-8">
                      <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-bold">All Attractions</h2>
                          <Button onClick={() => openEdit()}><Icons.Plus /> Add Attraction</Button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {attractions.map(attr => (
                              <Card key={attr.id} className="relative group p-0">
                                  <img src={attr.imageUrl} className="h-32 w-full object-cover" alt={attr.title} />
                                  <div className="p-4">
                                      <h3 className="font-bold">{attr.title}</h3>
                                      <p className="text-xs text-gray-500">{attr.province} {attr.city}</p>
                                      <div className="flex justify-end gap-2 mt-4">
                                          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => openEdit(attr)}>Edit</Button>
                                          <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleDeleteAttraction(attr.id)}>Delete</Button>
                                      </div>
                                  </div>
                              </Card>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};