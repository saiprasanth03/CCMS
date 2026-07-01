import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, AlertTriangle, CheckCircle, BarChart3, 
  Settings, Search, Filter, MoreVertical, Menu, X, MapPin, Phone, Upload, UserPlus, ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const { user: currentUser } = React.useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Admin Creation State
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    phoneNumber: '',
    adminLevel: 'village',
    state: '',
    district: '',
    mandal: '',
    village: '',
    pincode: ''
  });
  const [createdAdmin, setCreatedAdmin] = useState(null);
  const [adminError, setAdminError] = useState('');
  
  // Search and Modal State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Bulk CSV Upload State
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkResults, setBulkResults] = useState([]);

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setBulkError('');
    setBulkLoading(true);
    setBulkResults([]);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length < 2) {
          throw new Error(t('admin.csvError'));
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const expectedHeaders = ['adminlevel', 'state'];
        const missing = expectedHeaders.filter(h => !headers.includes(h));
        if (missing.length > 0) {
          throw new Error(`${t('admin.csvMissing')}: ${missing.join(', ')}`);
        }
        
        const adminsData = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((h, index) => {
            if (h === 'adminlevel') obj.adminLevel = values[index];
            else obj[h] = values[index];
          });
          adminsData.push(obj);
        }
        
        const res = await api.post('/auth/register-admin-bulk', { admins: adminsData });
        setBulkResults(res.data.data);
      } catch (err) {
        setBulkError(err.message || err.response?.data?.error || t('admin.csvError'));
      } finally {
        setBulkLoading(false);
        e.target.value = null; // Reset input
      }
    };
    reader.readAsText(file);
  };

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.data);
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}/status`, { status: newStatus });
      fetchComplaints(); // Refresh data
    } catch (err) {
      alert(t('admin.statusUpdateFailed'));
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setCreatedAdmin(null);
    try {
      const payload = {
        fullName: adminForm.fullName,
        phoneNumber: adminForm.phoneNumber,
        adminLevel: adminForm.adminLevel,
        address: `${adminForm.village || ''} ${adminForm.mandal || ''} ${adminForm.district || ''}`.trim() || t('admin.na'),
        jurisdiction: {
          state: adminForm.state,
          district: adminForm.district,
          mandal: adminForm.mandal,
          village: adminForm.village,
          pincode: adminForm.pincode
        }
      };
      
      const res = await api.post('/auth/register-admin', payload);
      setCreatedAdmin(res.data.data);
      // Reset form fields
      setAdminForm({ ...adminForm, fullName: '', phoneNumber: '', pincode: '', village: '' });
    } catch (err) {
      setAdminError(err.response?.data?.error || t('admin.adminCreateFailed'));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordMsg({ type: 'error', text: t('admin.passwordMismatch') });
    }

    try {
      await api.put('/auth/update-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMsg({ type: 'success', text: t('admin.passwordChanged') });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordMsg({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.error || t('admin.passwordFailed') });
    }
  };

  // Advanced Search Filter
  const filteredComplaints = complaints.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    // Check various fields for match
    const matchId = c._id.toLowerCase().includes(q);
    const matchTitle = c.title.toLowerCase().includes(q);
    const matchName = c.user?.fullName?.toLowerCase().includes(q);
    const matchPhone = c.user?.phoneNumber?.toLowerCase().includes(q);
    
    // Location matching
    const loc = c.location || {};
    const matchStreet = loc.street?.toLowerCase().includes(q);
    const matchCity = loc.city?.toLowerCase().includes(q);
    const matchMandal = loc.mandal?.toLowerCase().includes(q);
    const matchDistrict = loc.district?.toLowerCase().includes(q);
    const matchState = loc.state?.toLowerCase().includes(q);
    const matchPincode = loc.pincode?.toLowerCase().includes(q);
    
    return matchId || matchTitle || matchName || matchPhone || matchStreet || matchCity || matchMandal || matchDistrict || matchState || matchPincode;
  });

  const total = complaints.length;
  const open = complaints.filter(c => c.status === 'Submitted' || c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    { title: t('admin.totalComplaints'), value: total, icon: <Users className="text-blue-500" />, bg: 'bg-blue-100' },
    { title: t('admin.openComplaints'), value: open, icon: <AlertTriangle className="text-yellow-500" />, bg: 'bg-yellow-100' },
    { title: t('admin.resolvedAllTime'), value: resolved, icon: <CheckCircle className="text-emerald-500" />, bg: 'bg-green-100' },
    { title: t('admin.resolutionRate'), value: `${resRate}%`, icon: <BarChart3 className="text-purple-500" />, bg: 'bg-purple-100' },
  ];

  return (
    <div className="min-h-screen flex bg-background pt-16">
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-white border-r border-gray-200 fixed h-full z-40 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('admin.sidebarTitle')}</h2>
          <nav className="space-y-2">
            <button onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
              <BarChart3 className="h-5 w-5" />
              <span>{t('admin.menuDashboard')}</span>
            </button>
            <button onClick={() => {setActiveTab('complaints'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'complaints' ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
              <AlertTriangle className="h-5 w-5" />
              <span>{t('admin.menuComplaints')}</span>
            </button>
            {currentUser?.adminLevel === 'superadmin' && (
              <button onClick={() => {setActiveTab('users'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Users className="h-5 w-5" />
                <span>{t('admin.menuUsers')}</span>
              </button>
            )}
            <button onClick={() => {setActiveTab('settings'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Settings className="h-5 w-5" />
              <span>{t('admin.menuSettings')}</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeTab === 'dashboard' ? t('admin.pageTitle') : activeTab.replace('-', ' ')}</h1>
            <p className="text-gray-600">{t('admin.pageSubtitle')}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="input-field pl-10 py-2 w-full md:w-80 border-gray-300" 
                placeholder={t('admin.searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-secondary px-4 py-2 flex items-center justify-center bg-white whitespace-nowrap w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" /> <span>{t('admin.filterBtn')}</span>
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 flex items-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`p-4 rounded-xl ${stat.bg} mr-4`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Dynamic Activity Area based on Tabs */}
        {(activeTab === 'dashboard' || activeTab === 'complaints') && (
          <div className="glass-card bg-white shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{activeTab === 'dashboard' ? t('admin.recentComplaints') : t('admin.allComplaints')}</h2>
              {searchQuery && <span className="text-sm text-gray-500">{`${t('admin.foundResults').replace('{n}', filteredComplaints.length)}`}</span>}
            </div>
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.id')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.user')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.complaintTitle')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.priority')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.status')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.time')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredComplaints.length === 0 ? (
                  <tr><td colSpan="7" className="py-8 text-center text-gray-500">{t('admin.noComplaints')}</td></tr>
                ) : (
                  filteredComplaints.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{item._id.substring(0,6).toUpperCase()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span>
                            {item.user?.fullName || t('admin.user')}
                            {item.isAnonymous && <span className="ml-2 text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{t('admin.anon')}</span>}
                          </span>
                          <span className="text-xs text-gray-400">{item.user?.phoneNumber || ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{item.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                          ${item.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' : 
                            item.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            item.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-primary cursor-pointer outline-none
                            ${item.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                              item.status === 'Submitted' ? 'bg-blue-100 text-blue-800' : 
                              item.status === 'Verified' ? 'bg-purple-100 text-purple-800' :
                              item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        >
                          <option value="Submitted">{t('admin.submitted')}</option>
                          <option value="Verified">{t('admin.verified')}</option>
                          <option value="In Progress">{t('admin.inProgress')}</option>
                          <option value="Resolved">{t('admin.resolved')}</option>
                          <option value="Rejected">{t('admin.rejected')}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        <button 
                          onClick={() => setSelectedComplaint(item)}
                          className="text-gray-400 hover:text-primary transition-colors focus:outline-none p-2 rounded-full hover:bg-blue-50"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="glass-card p-6 bg-white shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <UserPlus className="mr-2 text-primary h-6 w-6" /> {t('admin.generateAdmin')}
            </h2>
            
            {currentUser?.adminLevel !== 'superadmin' ? (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
                <AlertTriangle className="h-5 w-5 inline mr-2 mb-1" />
                {t('admin.generateAdminDesc')}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  {adminError && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{adminError}</div>}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.authorityName')}</label>
                      <input type="text" required className="input-field" placeholder={t('admin.authorityNamePlaceholder')} value={adminForm.fullName} onChange={e => setAdminForm({...adminForm, fullName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.officialPhone')}</label>
                      <input type="text" required className="input-field" placeholder={t('admin.phonePlaceholder')} value={adminForm.phoneNumber} onChange={e => setAdminForm({...adminForm, phoneNumber: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.adminLevel')}</label>
                    <select className="input-field bg-white" value={adminForm.adminLevel} onChange={e => setAdminForm({...adminForm, adminLevel: e.target.value})}>
                      <option value="state">{t('admin.stateLevel')}</option>
                      <option value="district">{t('admin.districtLevel')}</option>
                      <option value="mandal">{t('admin.mandalLevel')}</option>
                      <option value="village">{t('admin.villageLevel')}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.state')}</label>
                      <input type="text" required className="input-field" placeholder={t('admin.statePlaceholder')} value={adminForm.state} onChange={e => setAdminForm({...adminForm, state: e.target.value})} />
                    </div>
                    {(adminForm.adminLevel === 'district' || adminForm.adminLevel === 'mandal' || adminForm.adminLevel === 'village') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.district')}</label>
                        <input type="text" required className="input-field" placeholder={t('admin.districtPlaceholder')} value={adminForm.district} onChange={e => setAdminForm({...adminForm, district: e.target.value})} />
                      </div>
                    )}
                    {(adminForm.adminLevel === 'mandal' || adminForm.adminLevel === 'village') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.mandal')}</label>
                        <input type="text" required className="input-field" placeholder={t('admin.mandalPlaceholder')} value={adminForm.mandal} onChange={e => setAdminForm({...adminForm, mandal: e.target.value})} />
                      </div>
                    )}
                    {adminForm.adminLevel === 'village' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.village')}</label>
                          <input type="text" required className="input-field" placeholder={t('admin.villagePlaceholder')} value={adminForm.village} onChange={e => setAdminForm({...adminForm, village: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.pincode')}</label>
                          <input type="text" required className="input-field" placeholder={t('admin.pincodePlaceholder')} value={adminForm.pincode} onChange={e => setAdminForm({...adminForm, pincode: e.target.value})} />
                        </div>
                      </>
                    )}
                  </div>

                  <button type="submit" className="btn-primary w-full py-3 mt-4">{t('admin.generateBtn')}</button>
                </form>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col justify-center items-center text-center">
                  {createdAdmin ? (
                    <div className="w-full">
                      <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="font-bold">{t('admin.adminSuccess')}</p>
                      </div>
                      <div className="bg-white p-4 rounded border border-gray-200 text-left space-y-3 shadow-sm">
                        <p className="text-sm text-gray-500">{t('admin.adminSuccessDesc')}</p>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">{t('admin.adminId')}</p>
                          <p className="font-mono text-lg font-bold text-primary bg-blue-50 p-2 rounded select-all">{createdAdmin.systemId}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">{t('admin.tempPassword')}</p>
                          <p className="font-mono text-lg font-bold text-primary bg-blue-50 p-2 rounded select-all">{createdAdmin.password}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <ShieldAlert className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>{t('admin.credentialsEmpty')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="glass-card p-6 bg-white shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
               <Upload className="mr-2 h-5 w-5 text-gray-500" /> {t('admin.bulkUpload')}
             </h3>
             <p className="text-sm text-gray-500 mb-4">
               {t('admin.bulkUploadDesc')} <strong>{t('admin.csvHeaders')}</strong>
             </p>
             
             <input 
               type="file" 
               accept=".csv" 
               id="csv-upload" 
               className="hidden" 
               onChange={handleCsvUpload} 
             />
             <label 
               htmlFor="csv-upload" 
               className={`btn-secondary text-sm px-4 py-2 inline-block cursor-pointer ${bulkLoading ? 'opacity-50 pointer-events-none' : ''}`}
             >
               {bulkLoading ? t('admin.processing') : t('admin.uploadCSV')}
             </label>
             {bulkError && <p className="text-red-500 text-sm mt-2">{bulkError}</p>}

             {bulkResults.length > 0 && (
               <div className="mt-6">
                 <h4 className="font-bold text-gray-800 mb-2">{t('admin.successGenerated').replace('{n}', bulkResults.length)}</h4>
                 <div className="max-h-60 overflow-y-auto border border-gray-200 rounded">
                   <table className="min-w-full divide-y divide-gray-200 text-sm">
                     <thead className="bg-gray-50">
                       <tr>
                         <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">{t('admin.bulkLevel')}</th>
                         <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">{t('admin.bulkLocation')}</th>
                         <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">{t('admin.bulkAdminId')}</th>
                         <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">{t('admin.bulkPassword')}</th>
                       </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                       {bulkResults.map((res, i) => (
                         <tr key={i}>
                           <td className="px-4 py-2 capitalize">{res.adminLevel}</td>
                           <td className="px-4 py-2">{res.location?.state} {res.location?.district ? `- ${res.location.district}` : ''}</td>
                           <td className="px-4 py-2 font-mono text-primary select-all">{res.systemId}</td>
                           <td className="px-4 py-2 font-mono text-primary select-all">{res.password}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}
          </div>
        </div>
      )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="glass-card p-6 bg-white shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Settings className="mr-2 text-primary h-6 w-6" /> {t('admin.systemSettings')}
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('admin.profileInfo')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('admin.nameTitle')}</p>
                      <p className="font-medium">{currentUser?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('admin.adminIdLabel')}</p>
                      <p className="font-medium font-mono text-primary">{currentUser?.systemId || t('admin.na')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('admin.emailAddress')}</p>
                      <p className="font-medium">{currentUser?.email || t('admin.notRegistered')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('admin.adminLevelLabel')}</p>
                      <p className="font-medium capitalize">{currentUser?.adminLevel}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {!isChangingPassword ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        className="btn-secondary flex-1 py-3" 
                        onClick={() => setIsChangingPassword(true)}
                      >
                        {t('admin.changePassword')}
                      </button>
                      <button 
                        className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors border border-red-200"
                        onClick={() => {
                          localStorage.removeItem('token');
                          window.location.href = '/login';
                        }}
                      >
                        {t('admin.logoutDashboard')}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">{t('admin.changePassword')}</h3>
                        <button type="button" onClick={() => setIsChangingPassword(false)} className="text-gray-500 hover:text-gray-700">
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {passwordMsg.text && (
                        <div className={`p-3 rounded text-sm ${passwordMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {passwordMsg.text}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.currentPassword')}</label>
                        <input 
                          type="password" required className="input-field" 
                          value={passwordForm.currentPassword} 
                          onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.newPassword')}</label>
                        <input 
                          type="password" required className="input-field" 
                          value={passwordForm.newPassword} 
                          onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.confirmNewPassword')}</label>
                        <input 
                          type="password" required className="input-field" 
                          value={passwordForm.confirmPassword} 
                          onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary flex-1 py-2">{t('admin.updatePassword')}</button>
                        <button type="button" className="btn-secondary flex-1 py-2" onClick={() => setIsChangingPassword(false)}>{t('admin.cancel')}</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedComplaint(null)}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  {t('admin.complaintDetail')} #{selectedComplaint._id.substring(0,6).toUpperCase()}
                </h3>
                <button onClick={() => setSelectedComplaint(null)} className="text-gray-400 hover:text-gray-700 bg-gray-200 p-1 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900">{selectedComplaint.title}</h4>
                  <p className="text-gray-600 mt-2 whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('admin.reporterDetails')}</h5>
                    <div className="flex items-center mb-1">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-800">{selectedComplaint.user?.fullName || t('admin.anonymous')}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{selectedComplaint.user?.phoneNumber || t('admin.na')}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('admin.location')}</h5>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-600">
                        {selectedComplaint.location ? (
                          <>
                            {selectedComplaint.location.street}<br/>
                            {selectedComplaint.location.city}, {selectedComplaint.location.mandal}<br/>
                            {selectedComplaint.location.district}, {selectedComplaint.location.state} - {selectedComplaint.location.pincode}
                          </>
                        ) : t('admin.locationNotProvided')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button onClick={() => setSelectedComplaint(null)} className="btn-secondary px-6">
                  {t('admin.close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
