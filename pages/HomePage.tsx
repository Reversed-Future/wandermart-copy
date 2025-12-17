import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Input, Card, Badge, Icons, Textarea, ImageUploader } from '../components/ui';
import * as API from '../services/api';
import { Attraction } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// --- STATIC REGION DATA FOR CASCADING SELECTS ---
const REGION_DATA: Record<string, Record<string, string[]>> = {
  '北京市': {
    '北京市': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '延庆区']
  },
  '四川省': { 
    '成都市': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '都江堰市'],
    '阿坝藏族羌族自治州': ['马尔康市', '九寨沟县', '若尔盖县']
  },
  '浙江省': {
    '杭州市': ['上城区', '拱墅区', '西湖区', '滨江区']
  }
};

const uniqueTags = Array.from(new Set([
  'Nature', 'Hiking', 'Water', 
  'History', 'Culture', 'Shopping', 
  'Ocean', 'Mountain', 'Animals', 'Architecture', 'Family'
])).sort();

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { notify } = useNotification();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  // Suggestion State
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<Partial<Attraction>>({
    title: '', description: '', address: '', province: '', city: '', county: '', tags: []
  });
  const [suggestionImages, setSuggestionImages] = useState<string[]>([]);

  // Read state from URL
  const query = searchParams.get('q') || '';
  const province = searchParams.get('province') || '';
  const city = searchParams.get('city') || '';
  const county = searchParams.get('county') || '';
  const tag = searchParams.get('tag') || '';

  // Calculate available options based on selection
  const provinces = Object.keys(REGION_DATA);
  const cities = province && REGION_DATA[province] ? Object.keys(REGION_DATA[province]) : [];
  const counties = province && city && REGION_DATA[province][city] ? REGION_DATA[province][city] : [];

  useEffect(() => {
    setLoading(true);
    API.getAttractions({ province, city, county, query, tag }).then(res => {
      if (res.data) setAttractions(res.data);
      setLoading(false);
    });
  }, [query, province, city, county, tag]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    // Reset dependent fields
    if (key === 'province') {
      newParams.delete('city');
      newParams.delete('county');
    }
    if (key === 'city') {
      newParams.delete('county');
    }

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const handleSuggestionSubmit = async () => {
    if (!suggestion.title || !suggestion.description || !suggestion.province) {
        notify("Please fill in the required fields.", "error");
        return;
    }

    const res = await API.createAttraction({
        ...suggestion,
        imageUrls: suggestionImages,
        submittedBy: user?.username,
        submittedById: user?.id,
        status: 'pending'
    });

    if (res.success) {
        notify("Attraction submitted successfully! It is pending admin approval.", "success");
        setIsSuggesting(false);
        setSuggestion({ title: '', description: '', address: '', province: '', city: '', county: '', tags: [] });
        setSuggestionImages([]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-10 bg-blue-50 rounded-xl px-4 relative overflow-hidden">
        <h1 className="text-4xl font-extrabold text-blue-900">Discover China's Wonders</h1>
        <p className="text-lg text-blue-700 max-w-2xl mx-auto">Explore hidden gems across provinces, cities, and counties.</p>
        
        {user && !isSuggesting && (
            <div className="absolute top-4 right-4">
                <Button variant="secondary" onClick={() => setIsSuggesting(true)} className="text-sm shadow-sm bg-white hover:bg-gray-100">
                    <Icons.Plus /> Suggest Attraction
                </Button>
            </div>
        )}
        
        <div className="max-w-4xl mx-auto space-y-4 mt-6">
          <div className="relative">
            <Input 
              placeholder="Search attractions by name or description..." 
              value={query} 
              onChange={(e) => updateFilter('q', e.target.value)} 
              className="pl-10"
            />
            <div className="absolute top-2.5 left-3 text-gray-400"><Icons.Search /></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select 
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
              value={province}
              onChange={(e) => updateFilter('province', e.target.value)}
            >
              <option value="">All Provinces</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select 
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full disabled:bg-gray-100 disabled:text-gray-400"
              value={city}
              onChange={(e) => updateFilter('city', e.target.value)}
              disabled={!province}
            >
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full disabled:bg-gray-100 disabled:text-gray-400"
              value={county}
              onChange={(e) => updateFilter('county', e.target.value)}
              disabled={!city}
            >
              <option value="">All Districts/Counties</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
              value={tag}
              onChange={(e) => updateFilter('tag', e.target.value)}
            >
              <option value="">All Tags</option>
              {uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          {(query || province || tag) && (
            <div className="flex justify-center">
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {isSuggesting && (
          <Card className="p-6 bg-white border border-blue-200 shadow-md">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Suggest a New Attraction</h3>
                  <button onClick={() => setIsSuggesting(false)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Title *" value={suggestion.title} onChange={e => setSuggestion({...suggestion, title: e.target.value})} />
                  <Input label="Address" value={suggestion.address} onChange={e => setSuggestion({...suggestion, address: e.target.value})} />
                  
                  <Input label="Province *" value={suggestion.province} onChange={e => setSuggestion({...suggestion, province: e.target.value})} placeholder="e.g. 四川省" />
                  <Input label="City" value={suggestion.city} onChange={e => setSuggestion({...suggestion, city: e.target.value})} placeholder="e.g. 成都市" />
                  <Input label="County" value={suggestion.county} onChange={e => setSuggestion({...suggestion, county: e.target.value})} />
                  
                  <div className="md:col-span-2">
                     <ImageUploader 
                       images={suggestionImages}
                       onChange={setSuggestionImages}
                       label="Upload Photos (First image will be cover)"
                     />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Select multiple)</label>
                    <div className="flex flex-wrap gap-2">
                        {uniqueTags.map(t => (
                            <button 
                                key={t}
                                type="button"
                                onClick={() => {
                                    const current = suggestion.tags || [];
                                    const newTags = current.includes(t) 
                                        ? current.filter(tag => tag !== t)
                                        : [...current, t];
                                    setSuggestion({...suggestion, tags: newTags});
                                }}
                                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                    (suggestion.tags || []).includes(t)
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
                      <Textarea label="Description *" value={suggestion.description} onChange={e => setSuggestion({...suggestion, description: e.target.value})} />
                  </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setIsSuggesting(false)}>Cancel</Button>
                  <Button onClick={handleSuggestionSubmit}>Submit for Review</Button>
              </div>
          </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {(query || province || city || tag) ? 'Search Results' : 'Featured Attractions'}
        </h2>
        {loading ? <div className="text-center py-10">Loading...</div> : (
          <>
            {attractions.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                No attractions found matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attractions.map(attr => (
                  <Link key={attr.id} to={`/attractions/${attr.id}`} className="block h-full group">
                    <Card className="h-full hover:shadow-lg transition-all duration-200 border-transparent hover:border-blue-200 flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <img src={attr.imageUrl} alt={attr.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {attr.province && <Badge color="blue">{attr.province}</Badge>}
                          {attr.city && <Badge color="indigo">{attr.city}</Badge>}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">{attr.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">{attr.description}</p>
                        <div className="flex flex-wrap gap-1 mt-auto">
                           {attr.tags.slice(0, 3).map(t => <Badge key={t} color="green">{t}</Badge>)}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};