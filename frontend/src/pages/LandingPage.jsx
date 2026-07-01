import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Clock, MapPin, Layers, TrendingUp, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  

  const handleReportClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/submit-complaint');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 z-0" />
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary font-medium text-sm mb-8 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              {t('landing.badge')}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight"
            >
              {t('landing.heroTitle')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed"
            >
              {t('landing.heroDesc')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6"
            >
              <button onClick={handleReportClick} className="btn-primary text-lg px-8 py-4 flex items-center shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all w-full sm:w-auto justify-center">
                {t('landing.reportBtn')} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <Link to="/track" className="glass-card hover:bg-gray-50 text-gray-800 font-bold text-lg px-8 py-4 border border-gray-200 hover:-translate-y-1 transition-all w-full sm:w-auto text-center">
                {t('landing.trackBtn')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The "Unique Feature" Highlight Section */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-primary font-bold tracking-wider uppercase text-sm mb-2">{t('landing.featureTitle')}</div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                {t('landing.featureDesc')}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t('landing.featureRegister')}
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mr-3" />
                  <p className="text-gray-700"><strong>{t('landing.pinpoint')}</strong> {t('landing.pinpointDesc')}</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-warning flex-shrink-0 mr-3" />
                  <p className="text-gray-700"><strong>{t('landing.timeBound')}</strong> {t('landing.timeBoundDesc')}</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-red-500 flex-shrink-0 mr-3" />
                  <p className="text-gray-700"><strong>{t('landing.autoEscalation')}</strong> {t('landing.autoEscalationDesc')}</p>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-50 rounded-3xl transform rotate-3" />
              <div className="glass-card relative p-8 rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border border-white">
                <div className="flex flex-col space-y-4">
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-red-800">{t('landing.stateAdmin')}</h4>
                      <p className="text-xs text-red-600">{t('landing.stateAdminDesc')}</p>
                    </div>
                    <Layers className="text-red-400 h-6 w-6" />
                  </div>
                  <div className="w-1 h-6 bg-gray-200 mx-auto" />
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-orange-800">{t('landing.districtCollector')}</h4>
                      <p className="text-xs text-orange-600">{t('landing.districtCollectorDesc')}</p>
                    </div>
                    <Layers className="text-orange-400 h-6 w-6" />
                  </div>
                  <div className="w-1 h-6 bg-gray-200 mx-auto" />
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-blue-800">{t('landing.mandalOfficer')}</h4>
                      <p className="text-xs text-blue-600">{t('landing.mandalOfficerDesc')}</p>
                    </div>
                    <Layers className="text-blue-400 h-6 w-6" />
                  </div>
                  <div className="w-1 h-6 bg-gray-200 mx-auto" />
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between ring-2 ring-green-400 shadow-lg scale-105">
                    <div>
                      <h4 className="font-bold text-green-800">{t('landing.villageAuth')}</h4>
                      <p className="text-xs text-green-600">{t('landing.villageAuthDesc')}</p>
                    </div>
                    <Layers className="text-green-500 h-6 w-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">{t('landing.escalationTitle')}</h2>
            <p className="mt-4 text-xl text-gray-600">{t('landing.escalationSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.geoTitle')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.geoDesc')}</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-success" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.liveTitle')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.liveDesc')}</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.dataTitle')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.dataDesc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">{t('landing.ctaTitle')}</h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10">{t('landing.escalationDesc')}</p>
          <button onClick={handleReportClick} className="bg-white text-primary hover:bg-gray-50 text-xl font-bold px-10 py-4 rounded-xl shadow-lg transition-transform hover:scale-105">
            {t('landing.ctaBtn')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
