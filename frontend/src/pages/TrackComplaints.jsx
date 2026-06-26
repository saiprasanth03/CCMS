import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

const TrackComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints');
        setComplaints(res.data.data);
      } catch (err) {
        console.error('Failed to fetch complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const filtered = complaints.filter(c => 
    c._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 bg-background px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Track Public Complaints</h1>
            <p className="text-gray-600">Search and track community issues in real-time</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search ID, Title, Category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl w-full"></div>)}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 glass-card">No complaints found.</div>
            ) : (
              filtered.map((complaint) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={complaint._id} 
                  className="glass-card p-6 flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">#{complaint._id.substring(0,8).toUpperCase()}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                        complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {complaint.status}
                      </span>
                      <span className="text-xs font-medium text-gray-500 border border-gray-200 px-2 py-1 rounded">
                        Priority: {complaint.priority}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{complaint.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{complaint.description.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-400 mt-2">{complaint.category} • {new Date(complaint.createdAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaints;
