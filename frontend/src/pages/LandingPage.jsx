import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Clock, MapPin, Layers, TrendingUp, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const LandingPage = () => {
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
              Next-Gen Civic Management System
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight"
            >
              Bridging the gap between <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-accent">
                Citizens & Government
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed"
            >
              Report infrastructural issues, track real-time resolution, and hold local authorities accountable through our automated hierarchical escalation matrix.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6"
            >
              <button onClick={handleReportClick} className="btn-primary text-lg px-8 py-4 flex items-center shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all w-full sm:w-auto justify-center">
                Report an Issue <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <Link to="/track" className="glass-card hover:bg-gray-50 text-gray-800 font-bold text-lg px-8 py-4 border border-gray-200 hover:-translate-y-1 transition-all w-full sm:w-auto text-center">
                Track Complaint
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
              <div className="text-primary font-bold tracking-wider uppercase text-sm mb-2">Our Unique Feature</div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Automated Hierarchical <br/>Escalation
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Unlike generic complaint portals that dump all tickets into a single massive queue, CCMS uses a smart jurisdiction router.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mr-3" />
                  <p className="text-gray-700"><strong>Pinpoint Routing:</strong> Complaints are instantly assigned to the specific Village or Ward Officer.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-warning flex-shrink-0 mr-3" />
                  <p className="text-gray-700"><strong>Time-Bound Action:</strong> If an issue isn't resolved within the SLA (Service Level Agreement) timeframe...</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-red-500 flex-shrink-0 mr-3" />
                  <p className="text-gray-700"><strong>Automatic Escalation:</strong> It automatically escalates to Mandal, then District, and finally State-level Superadmins.</p>
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
                      <h4 className="font-bold text-red-800">State Admin (Highest)</h4>
                      <p className="text-xs text-red-600">Views unresolved critical escalations</p>
                    </div>
                    <Layers className="text-red-400 h-6 w-6" />
                  </div>
                  <div className="w-1 h-6 bg-gray-200 mx-auto" />
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-orange-800">District Collector</h4>
                      <p className="text-xs text-orange-600">Escalated after 14 days</p>
                    </div>
                    <Layers className="text-orange-400 h-6 w-6" />
                  </div>
                  <div className="w-1 h-6 bg-gray-200 mx-auto" />
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-blue-800">Mandal Officer</h4>
                      <p className="text-xs text-blue-600">Escalated after 7 days</p>
                    </div>
                    <Layers className="text-blue-400 h-6 w-6" />
                  </div>
                  <div className="w-1 h-6 bg-gray-200 mx-auto" />
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between ring-2 ring-green-400 shadow-lg scale-105">
                    <div>
                      <h4 className="font-bold text-green-800">Village Authority (Direct)</h4>
                      <p className="text-xs text-green-600">Immediate assignment upon submission</p>
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
            <h2 className="text-3xl font-extrabold text-gray-900">Built for Transparency</h2>
            <p className="mt-4 text-xl text-gray-600">Everything you need to track civic improvements in your neighborhood.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Geo-Tagged Evidence</h3>
              <p className="text-gray-600 leading-relaxed">Upload photos with strict location data so authorities know exactly where the problem is located, reducing survey times.</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-success" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Status Tracking</h3>
              <p className="text-gray-600 leading-relaxed">No more black boxes. Track your complaint status from "Received" to "In Progress" to "Resolved" with timestamps.</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Analytics</h3>
              <p className="text-gray-600 leading-relaxed">Public dashboards allow citizens to view resolution rates for different mandals and districts, promoting healthy competition.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Ready to make a difference?</h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10">It takes less than 2 minutes to report a civic issue and trigger a government response.</p>
          <button onClick={handleReportClick} className="bg-white text-primary hover:bg-gray-50 text-xl font-bold px-10 py-4 rounded-xl shadow-lg transition-transform hover:scale-105">
            Register a Complaint Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
