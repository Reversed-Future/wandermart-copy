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

  useEffect(() => {
    API.getReportedContent().then(res => res.data && setReports(res.data));
    API.getPendingMerchants().then(res => res.data && setPendingMerchants(res.data));
    API.getAttractions({}).then(res => res.data && setAttractions(res.data));
    API.getPendingAttractions().then(res => res.data && setPendingAttractions(res.data));
  }, []);

  const handleModeration = async (id: string, action: 'approve' | 'delete') => {
    await API.moderateContent(id, action);
    setReports(reports.filter(r => r.id !== id));
    notify(action === 'delete' ? "Post deleted" : "Post approved", "success");
  };

  const handleMerchantApproval = async (id: string, status: 'active' | 'rejected') => {
      await API.updateUserStatus(id, status);
      setPendingMerchants(pendingMerchants.filter(u => u.id !== id));
      notify(`User ${status === 'active' ? 'Approved' : 'Rejected'}`, status === 'active' ? "success" : "info");
  };

  const handleAttractionApproval = async (id: string, action: 'approve' | 'reject') => {
      if (action === 'approve') {
          const res = await API.updateAttraction(id, { status: 'active' });
          if (res.success && res.data) {
              setPendingAttractions(pendingAttractions.filter(a => a.id !== id));
              setAttractions([...attractions, res.data]);
              notify("Attraction approved and published", "success");
          }
      } else {
          confirm("Reject this attraction submission? It will be deleted.", async () => {
              await API.deleteAttraction(id);
              setPendingAttractions(pendingAttractions.filter(a => a.id !== id));
              notify("Submission rejected", "info");
          });
      }
  };

  const handleSaveAttraction = async () => {
      if (!editingAttr) return;
      
      if (!editingAttr.title || !editingAttr.description || !editingAttr.province || !editingAttr.city || !editingAttr.county) {
          notify("Please fill in all required fields (Title, Description, Province, City, County).", "error");
          return;
      }

      const payload = { ...editingAttr, imageUrls: editingImages };

      if (editingAttr.id) {
          // Update
          const res = await API.updateAttraction(editingAttr.id, payload);
          if (res.success && res.data) {
              setAttractions(attractions.map(a => a.id === res.data!.id ? res.data! : a));
          }
      } else {
          // Create
          const res = await API.createAttraction(payload);
          if (res.success && res.data) {
              setAttractions([res.data!, ...attractions]);
          }
      }
      setIsEditing(false);
      setEditingAttr(null);
      setEditingImages([]);
      notify("Attraction saved successfully", "success");
  };

  const handleDeleteAttraction = (id: string) => {
      confirm("Are you sure? This cannot be undone.", async () => {
          await API.deleteAttraction(id);
          setAttractions(attractions.filter(a => a.id !== id));
          notify("Attraction deleted", "info");
      });
  };

  const openEdit = (attr?: Attraction) => {
      setEditingAttr(attr || { title: '', description: '', address: '', province: '', city: '', county: '', tags: [], openHours: '', drivingTips: '', travelerTips: '' });
      setEditingImages(attr?.imageUrls || (attr?.imageUrl ? [attr.imageUrl] : []));
      setIsEditing(true);
  };

  const handleEditProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!editingAttr) return;
      setEditingAttr({
          ...editingAttr, 
          province: e.target.value,
          city: '',
          county: ''
      });
  };

  const handleEditCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!editingAttr) return;
      setEditingAttr({
          ...editingAttr, 
          city: e.target.value,
          county: ''
      });
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
        <div>
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
          <div>
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
          <div>
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
                                  {attr.imageUrls && attr.imageUrls.length > 1 && (
                                      <div className="flex gap-1 mb-3">
                                          {attr.imageUrls.slice(1).map((u, i) => (
                                              <img key={i} src={u} className="w-12 h-12 rounded object-cover" alt="thumb" />
                                          ))}
                                      </div>
                                  )}
                                  <div className="flex gap-2">
                                      <Button className="text-sm py-1 bg-green-600 hover:bg-green-700" onClick={() => handleAttractionApproval(attr.id, 'approve')}>Approve & Publish</Button>
                                      <Button variant="danger" className="text-sm py-1" onClick={() => handleAttractionApproval(attr.id, 'reject')}>Reject</Button>
                                  </div>
                              </div>
                          </Card>
                      ))}
                  </div>
              )}
          </div>
      )}

      {activeTab === 'attractions' && (
          <div>
              {isEditing ? (
                  <Card className="p-6 bg-gray-50">
                      <h3 className="font-bold mb-4">{editingAttr?.id ? 'Edit Attraction' : 'New Attraction'}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                          <Input label="Title *" value={editingAttr?.title} onChange={e => setEditingAttr({...editingAttr, title: e.target.value})} />
                          <Input label="Address *" value={editingAttr?.address} onChange={e => setEditingAttr({...editingAttr, address: e.target.value})} />
                          
                          {/* Province */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                              <select 
                                  className="w-full border border-gray-300 rounded px-3 py-2"
                                  value={editingAttr?.province || ''}
                                  onChange={handleEditProvinceChange}
                              >
                                  <option value="">Select Province</option>
                                  {Object.keys(REGION_DATA).map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                          </div>

                          {/* City */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                              <select 
                                  className="w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100"
                                  value={editingAttr?.city || ''}
                                  onChange={handleEditCityChange}
                                  disabled={!editingAttr?.province}
                              >
                                  <option value="">Select City</option>
                                  {editingAttr?.province && REGION_DATA[editingAttr.province] && Object.keys(REGION_DATA[editingAttr.province]).map(c => (
                                      <option key={c} value={c}>{c}</option>
                                  ))}
                              </select>
                          </div>

                          {/* County */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
                              <select 
                                  className="w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100"
                                  value={editingAttr?.county || ''}
                                  onChange={e => setEditingAttr({...editingAttr, county: e.target.value})}
                                  disabled={!editingAttr?.city}
                              >
                                  <option value="">Select County</option>
                                  {editingAttr?.province && editingAttr?.city && REGION_DATA[editingAttr.province][editingAttr.city] && REGION_DATA[editingAttr.province][editingAttr.city].map(c => (
                                      <option key={c} value={c}>{c}</option>
                                  ))}
                              </select>
                          </div>
                          
                          <div className="md:col-span-2">
                             <ImageUploader 
                               images={editingImages}
                               onChange={setEditingImages}
                               label="Photos"
                             />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {uniqueTags.map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => {
                                            const current = editingAttr?.tags || [];
                                            const newTags = current.includes(t) 
                                                ? current.filter(tag => tag !== t)
                                                : [...current, t];
                                            setEditingAttr({...editingAttr, tags: newTags});
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                            (editingAttr?.tags || []).includes(t)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                          </div>
                          
                          <div className="md:col-span-2">
                              <Input label="Open Hours" value={editingAttr?.openHours || ''} onChange={e => setEditingAttr({...editingAttr, openHours: e.target.value})} />
                          </div>
                          <div className="md:col-span-2">
                              <Textarea label="Driving Tips" value={editingAttr?.drivingTips || ''} onChange={e => setEditingAttr({...editingAttr, drivingTips: e.target.value})} />
                          </div>
                          <div className="md:col-span-2">
                              <Textarea label="Traveler Tips" value={editingAttr?.travelerTips || ''} onChange={e => setEditingAttr({...editingAttr, travelerTips: e.target.value})} />
                          </div>

                          <div className="md:col-span-2">
                             <Textarea label="Description *" value={editingAttr?.description} onChange={e => setEditingAttr({...editingAttr, description: e.target.value})} />
                          </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                          <Button onClick={handleSaveAttraction}>Save</Button>
                          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                  </Card>
              ) : (
                  <div>
                      <div className="flex justify-end mb-4">
                          <Button onClick={() => openEdit()}><Icons.Plus /> Add Attraction</Button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {attractions.map(attr => (
                              <Card key={attr.id} className="relative group">
                                  <img src={attr.imageUrl} className="h-32 w-full object-cover" alt={attr.title} />
                                  <div className="p-4">
                                      <h3 className="font-bold">{attr.title}</h3>
                                      <p className="text-xs text-gray-500">{attr.region}</p>
                                      <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
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