import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Send, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    street: '',
    city: '',
    mandal: '',
    district: '',
    state: 'Andhra Pradesh',
    pincode: '',
    priority: 'Medium',
    isAnonymous: false
  });
  
  // Default position: Andhra Pradesh
  const [position, setPosition] = useState({ lat: 15.9129, lng: 79.7400 });
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  
  useEffect(() => {
    // Try to get user's actual location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Geolocation error:', err)
      );
    }
  }, []);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuccess, setAiSuccess] = useState('');

  const categories = [
    'Garbage', 'Road Damage', 'Drainage', 'Water Leakage', 
    'Street Light', 'Electricity', 'Pollution', 'Illegal Construction', 
    'Noise Complaint', 'Animal Issues', 'Public Safety', 'Other'
  ];

  const handleAIAssist = () => {
    if (!formData.description || formData.description.length < 10) {
      setError('Please provide a longer description (at least 10 chars) for AI analysis.');
      return;
    }
    setAiLoading(true);
    setError('');
    
    // Simulate AI processing delay
    setTimeout(() => {
      const desc = formData.description.toLowerCase();
      let detectedCategory = 'Other';
      let detectedPriority = 'Medium';

      if (desc.includes('water') || desc.includes('leak') || desc.includes('pipe')) {
        detectedCategory = 'Water Leakage';
        detectedPriority = 'Urgent';
      } else if (desc.includes('pothole') || desc.includes('road')) {
        detectedCategory = 'Road Damage';
        detectedPriority = 'High';
      } else if (desc.includes('garbage') || desc.includes('trash') || desc.includes('dump')) {
        detectedCategory = 'Garbage';
        detectedPriority = 'Medium';
      } else if (desc.includes('light') || desc.includes('dark')) {
        detectedCategory = 'Street Light';
        detectedPriority = 'Low';
      } else if (desc.includes('noise') || desc.includes('loud')) {
        detectedCategory = 'Noise Complaint';
        detectedPriority = 'Low';
      } else if (desc.includes('danger') || desc.includes('fire') || desc.includes('accident')) {
        detectedCategory = 'Public Safety';
        detectedPriority = 'Urgent';
      }

      setFormData(prev => ({
        ...prev,
        category: detectedCategory,
        priority: detectedPriority
      }));
      setAiLoading(false);
      setAiSuccess(`AI Detection Complete: Identified as ${detectedCategory} (${detectedPriority} Priority)`);
      setTimeout(() => setAiSuccess(''), 5000);
    }, 1500);
  };

  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!mapSearchQuery) return;
    setIsSearchingMap(true);
    try {
      // Use Nominatim open API for simple forward geocoding
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition({ lat, lng: lon });
      } else {
        alert("Location not found. Try being more specific.");
      }
    } catch (err) {
      console.error(err);
      alert("Error searching map.");
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a complaint.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        isAnonymous: formData.isAnonymous,
        location: {
          street: formData.street,
          city: formData.city,
          mandal: formData.mandal,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          lat: position.lat,
          lng: position.lng
        }
      };
      
      await api.post('/complaints', payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 shadow-xl"
        >
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
            <p className="text-gray-600 mt-2">Please provide detailed information to help us resolve the issue faster.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center text-sm font-medium">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Title</label>
                <input 
                  type="text" required className="input-field" 
                  placeholder="E.g., Large pothole on Main Street"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  required className="input-field bg-white"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                <select 
                  className="input-field bg-white"
                  value={formData.priority}
                  onChange={(e) => updateField('priority', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Location Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Street / Landmark</label>
                    <input type="text" required className="input-field py-2" value={formData.street} onChange={(e) => updateField('street', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Village / City</label>
                    <input type="text" required className="input-field py-2" value={formData.city} onChange={(e) => updateField('city', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mandal</label>
                    <input type="text" required className="input-field py-2" value={formData.mandal} onChange={(e) => updateField('mandal', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
                    <input type="text" required className="input-field py-2" value={formData.district} onChange={(e) => updateField('district', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                    <input type="text" required className="input-field py-2" value={formData.state} onChange={(e) => updateField('state', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
                    <input type="text" required className="input-field py-2" value={formData.pincode} onChange={(e) => updateField('pincode', e.target.value)} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input 
                      type="text" 
                      placeholder="Search for a location (e.g. Vijayawada, AP)" 
                      className="input-field flex-grow"
                      value={mapSearchQuery}
                      onChange={e => setMapSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleMapSearch(e)}
                    />
                    <button 
                      type="button" 
                      onClick={handleMapSearch}
                      disabled={isSearchingMap}
                      className="btn-secondary px-4 py-2"
                    >
                      {isSearchingMap ? 'Searching...' : 'Search Map'}
                    </button>
                  </div>

                  <div className="h-64 bg-gray-200 rounded-lg overflow-hidden relative border border-gray-300">
                    <MapContainer 
                      center={position} 
                      zoom={13} 
                      scrollWheelZoom={true} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <MapUpdater center={position} />
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                    <div className="absolute top-2 right-2 z-[1000] bg-white px-3 py-1 rounded shadow-sm text-xs font-medium text-gray-700 pointer-events-none">
                      Click map to pin location
                    </div>
                  </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-end mb-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                  <button 
                    type="button" 
                    onClick={handleAIAssist}
                    disabled={aiLoading}
                    className="text-xs bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-full flex items-center hover:shadow-lg transition-all disabled:opacity-50 z-10"
                  >
                    {aiLoading ? (
                      <span className="flex items-center"><div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1"></div> Analyzing...</span>
                    ) : (
                      <span className="flex items-center"><Sparkles className="h-3 w-3 mr-1" /> Auto-Fill with AI</span>
                    )}
                  </button>
                </div>
                {aiSuccess && (
                  <div className="mb-2 text-xs text-green-600 flex items-center font-medium animate-pulse">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> {aiSuccess}
                  </div>
                )}
                <textarea 
                  required className="input-field py-3 min-h-[120px]" 
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                ></textarea>
              </div>

              <div className="md:col-span-2 flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-100 mt-2">
                <input 
                  type="checkbox" id="anonymous" 
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                  checked={formData.isAnonymous}
                  onChange={(e) => updateField('isAnonymous', e.target.checked)}
                />
                <label htmlFor="anonymous" className="ml-3 block text-sm font-medium text-gray-800 flex items-center cursor-pointer">
                  Submit Anonymously
                  <AlertCircle className="h-4 w-4 text-gray-400 ml-2" title="Your identity will be hidden from the public." />
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-4 border-t border-gray-100 mt-6 pt-6">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-8">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary px-8 flex items-center disabled:opacity-70">
                {loading ? 'Submitting...' : <><Send className="mr-2 h-4 w-4" /> Submit Report</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitComplaint;
