import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, CheckCircle, Clock, XCircle, 
  Plus, Activity, Bell, User
} from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const res = await api.get('/complaints');
        setRecentComplaints(res.data.data);
      } catch (err) {
        console.error('Error fetching complaints', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyComplaints();
  }, []);

  const total = recentComplaints.length;
  const resolved = recentComplaints.filter(c => c.status === 'Resolved').length;
  const pending = recentComplaints.filter(c => c.status === 'Submitted' || c.status === 'In Progress' || c.status === 'Verified').length;
  const rejected = recentComplaints.filter(c => c.status === 'Rejected').length;

  const stats = [
    { title: 'Total Complaints', value: total, icon: <FileText className="text-blue-500" />, bg: 'bg-blue-100' },
    { title: 'Resolved', value: resolved, icon: <CheckCircle className="text-emerald-500" />, bg: 'bg-green-100' },
    { title: 'Pending', value: pending, icon: <Clock className="text-yellow-500" />, bg: 'bg-yellow-100' },
    { title: 'Rejected', value: rejected, icon: <XCircle className="text-red-500" />, bg: 'bg-red-100' },
  ];

  return (
    <div className="min-h-screen pt-20 bg-background px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8 flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-primary to-secondary text-white border-none"
        >
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!</h1>
            <p className="text-blue-100">Here's an overview of your reported issues.</p>
          </div>
          <Link to="/submit-complaint" className="mt-4 sm:mt-0 bg-white text-primary px-6 py-2 rounded-lg font-medium shadow-md hover:bg-gray-50 flex items-center transition-colors">
            <Plus className="mr-2 h-5 w-5" /> New Complaint
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-4 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform duration-300 cursor-default"
                >
                  <div className={`p-3 rounded-full ${stat.bg} mb-3`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Complaints */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center text-gray-800">
                  <Activity className="mr-2 h-5 w-5 text-primary" /> Recent Complaints
                </h2>
                <Link to="/complaints" className="text-sm text-primary hover:underline font-medium">View All</Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-sm">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-gray-500">You haven't submitted any complaints yet.</td></tr>
                    ) : (
                      recentComplaints.map((item) => (
                        <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 text-sm font-medium text-gray-900">#{item._id.substring(0,6).toUpperCase()}</td>
                          <td className="py-4 text-sm text-gray-800">{item.title}</td>
                          <td className="py-4 text-sm text-gray-600">{item.category}</td>
                          <td className="py-4 text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium 
                              ${item.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                                item.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-blue-100 text-blue-800'}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="glass-card p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md uppercase">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{user?.fullName || 'User'}</h3>
                  <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <Link to="/profile" className="w-full flex items-center justify-center text-sm font-medium text-primary hover:text-secondary py-2 transition-colors">
                  <User className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold flex items-center mb-4 text-gray-800">
                <Bell className="mr-2 h-5 w-5 text-primary" /> Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="mt-0.5"><div className="h-2 w-2 bg-primary rounded-full"></div></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Status Updated</p>
                    <p className="text-xs text-gray-600 mt-1">Your complaint CMP-1022 was marked as Resolved.</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">2 hours ago</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent">
                  <div className="mt-0.5"><div className="h-2 w-2 bg-gray-300 rounded-full"></div></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Assigned to Officer</p>
                    <p className="text-xs text-gray-600 mt-1">CMP-1023 has been assigned to Public Works Dept.</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">1 day ago</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-sm text-center text-gray-500 hover:text-primary transition-colors font-medium">View All</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
