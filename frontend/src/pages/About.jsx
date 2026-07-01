import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Clock, Globe, Target, Eye, MessageSquare, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const About = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  
  const isDeveloper = user?.adminLevel === 'superadmin' || user?.systemId?.toLowerCase().includes('developer');

  const [showModal, setShowModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('feature');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/feedback', {
        type: feedbackType,
        message: feedbackMessage
      });
      setSuccess(true);
      setFeedbackMessage('');
    } catch (err) {
      setError(err.response?.data?.error || t('about.feedbackFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background pt-16 relative">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 to-primary text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Globe className="w-96 h-96 -mt-20 -mr-20" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">{t('about.storyTitle')}</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              {t('about.storyDesc')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0" />
            <div className="relative z-10">
              <Target className="w-12 h-12 text-primary mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.missionTitle')}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('about.missionDesc')}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-4 -mt-4 z-0" />
            <div className="relative z-10">
              <Eye className="w-12 h-12 text-success mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.visionTitle')}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('about.visionDesc')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('about.principlesTitle')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('about.principlesDesc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl text-center hover:shadow-lg transition-shadow border border-gray-100">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-xl text-gray-900 mb-2">{t('about.secureTitle')}</h3>
              <p className="text-gray-500">{t('about.secureDesc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl text-center hover:shadow-lg transition-shadow border border-gray-100">
              <Clock className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="font-bold text-xl text-gray-900 mb-2">{t('about.fastTitle')}</h3>
              <p className="text-gray-500">{t('about.fastDesc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl text-center hover:shadow-lg transition-shadow border border-gray-100">
              <Users className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="font-bold text-xl text-gray-900 mb-2">{t('about.communityTitle')}</h3>
              <p className="text-gray-500">{t('about.communityDesc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl text-center hover:shadow-lg transition-shadow border border-gray-100">
              <Globe className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-bold text-xl text-gray-900 mb-2">{t('about.accessibleTitle')}</h3>
              <p className="text-gray-500">{t('about.accessibleDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* {t('about.feedbackTitle')} Section */}
      {isDeveloper && (
        <section className="py-24 max-w-4xl mx-auto px-4 text-center">
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.devPortalTitle')}</h2>
            <p className="text-xl text-gray-600 mb-10">
              {t('about.devPortalDesc')}
            </p>
            <button 
              onClick={() => { setSuccess(false); setError(''); setShowModal(true); }}
              className="bg-primary text-white hover:bg-blue-700 font-bold px-8 py-4 rounded-xl shadow-lg transition-colors inline-flex items-center"
            >
              <MessageSquare className="mr-2 w-5 h-5" /> {t('about.submitFeedback')}
            </button>
          </div>
        </section>
      )}

      {/* Feedback Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-xl text-gray-900">{t('about.feedbackTitle')}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                {success ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{t('about.feedbackReceived')}</h4>
                    <p className="text-gray-600 mb-6">{t('about.feedbackThanks')}</p>
                    <button onClick={() => setShowModal(false)} className="btn-secondary px-6 py-2">{t('about.close')}</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('about.feedbackType')}</label>
                      <select 
                        value={feedbackType} 
                        onChange={(e) => setFeedbackType(e.target.value)}
                        className="input-field bg-white"
                      >
                        <option value="feature">{t('about.featureRequest')}</option>
                        <option value="bug">{t('about.bugReport')}</option>
                        <option value="other">{t('about.otherType')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('about.feedbackMessage')}</label>
                      <textarea 
                        required
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        className="input-field min-h-[120px] resize-none"
                        placeholder={t('about.feedbackPlaceholder')}
                      ></textarea>
                    </div>
                    
                    <div className="pt-2 flex justify-end gap-3">
                      <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-4 py-2">{t('about.cancel')}</button>
                      <button type="submit" disabled={loading} className="btn-primary px-6 py-2">
                        {loading ? t('about.submitting') : t('about.submitBtn')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default About;
