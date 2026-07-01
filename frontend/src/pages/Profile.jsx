import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
  const { user, updateMe } = useContext(AuthContext);
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Assuming a PUT /auth/profile endpoint exists or creating one.
      // Wait, we don't have an update profile endpoint yet. I'll need to create one.
      const res = await api.put('/auth/profile', formData);
      updateMe(res.data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || t('profile.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-background px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden shadow-lg"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white flex flex-col sm:flex-row items-center gap-6">
            <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl font-bold shadow-inner border-4 border-white/30 uppercase">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold">{user?.fullName || t('profile.title')}</h1>
              <p className="text-blue-100 flex items-center justify-center sm:justify-start mt-1">
                {user?.role === 'admin' ? (
                  <><Shield className="w-4 h-4 mr-1" /> {user?.adminLevel} {t('profile.adminRole')}</>
                ) : (
                  <><User className="w-4 h-4 mr-1" /> {t('profile.citizenRole')}</>
                )}
              </p>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{t('profile.personalInfo')}</h2>
            
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm text-green-700">{t('profile.updateSuccess')}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.fullName')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input-field pl-10"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.email')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      className="input-field pl-10 bg-gray-50"
                      value={formData.email}
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('profile.emailHelper')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.phone')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input-field pl-10"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.address')}</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      className="input-field pl-10 pt-3 min-h-[100px]"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center py-2 px-6"
                >
                  {loading ? t('profile.saving') : <><Save className="w-5 h-5 mr-2" /> {t('profile.saveChanges')}</>}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
