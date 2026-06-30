import React, { useState } from 'react';
import { ArrowRight, Shield, Globe, Zap, CheckCircle2, MessageSquare, Map as MapIcon, BarChart, LogIn, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';

export default function Landing({ onStart }: { onStart: (role: 'CITIZEN' | 'OFFICER', name: string, email: string, avatarUrl?: string) => void }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'CITIZEN' | 'OFFICER'>('CITIZEN');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Real user details derived from context as fallbacks
  const defaultUserEmail = "yadavmohit85692@gmail.com";
  const defaultUserName = "Mohit Yadav";
  const defaultUserAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120";

  React.useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#/auth') {
        setShowAuthModal(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Save selected role to localStorage so the auth persistence observer can pick it up
      localStorage.setItem('civic_user_role', selectedRole);

      setIsLoggingIn(false);
      setShowAuthModal(false);

      if (selectedRole === 'CITIZEN') {
        onStart(
          'CITIZEN', 
          user.displayName || defaultUserName, 
          user.email || defaultUserEmail, 
          user.photoURL || defaultUserAvatar
        );
      } else {
        onStart(
          'OFFICER', 
          user.displayName || 'Officer Williams', 
          user.email || 'williams.ops@civic.gov.in', 
          user.photoURL || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=120'
        );
      }
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      setIsLoggingIn(false);
      alert("Authentication failed: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
                The Future of Civic Tech
              </span>
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mb-8">
                Empower Your Community with <span className="text-blue-600">Civic AI</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                Report local issues, track resolutions in real-time, and collaborate with your municipality using AI-powered automation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-200"
                >
                  Get Started / Log In
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedRole('OFFICER');
                    setShowAuthModal(true);
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <Lock size={18} />
                  Municipality Portal
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Google Identity Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6 relative"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Secure Portal Log In</h3>
                <p className="text-sm text-gray-400">Choose your role to authenticate via Google Account.</p>
              </div>

              {/* Role Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CITIZEN')}
                  className={`p-4 rounded-2xl border text-center font-bold transition-all flex flex-col items-center gap-2 ${
                    selectedRole === 'CITIZEN' 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Globe size={20} />
                  <span className="text-xs">Citizen Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('OFFICER')}
                  className={`p-4 rounded-2xl border text-center font-bold transition-all flex flex-col items-center gap-2 ${
                    selectedRole === 'OFFICER' 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Lock size={20} />
                  <span className="text-xs">Municipality Officer</span>
                </button>
              </div>

              {/* Google Account Preview Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100/80 flex items-center gap-3">
                <img 
                  src={selectedRole === 'CITIZEN' ? defaultUserAvatar : "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=120"} 
                  alt="Google Profile" 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                />
                <div className="text-left min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Google Account Connected</span>
                  <span className="text-xs font-bold text-gray-800 block truncate">
                    {selectedRole === 'CITIZEN' ? defaultUserName : 'Officer Williams'}
                  </span>
                  <span className="text-[10px] text-gray-500 block truncate">
                    {selectedRole === 'CITIZEN' ? defaultUserEmail : 'williams.ops@civic.gov.in'}
                  </span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-100" />
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-all font-bold text-sm text-gray-700 bg-white"
              >
                {isLoggingIn ? (
                  <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.7 14.94 1 12 1 7.35 1 3.37 3.66 1.39 7.56l3.86 3C6.17 7.42 8.87 5.04 12 5.04z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.71-4.94 3.71-8.6z"/>
                    <path fill="#FBBC05" d="M5.25 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 7.56C.5 9.36 0 11.38 0 13.5s.5 4.14 1.39 5.94l3.86-3.88z"/>
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.34 1.1-4.26 1.1-3.13 0-5.83-2.38-6.75-5.52l-3.86 3C3.37 20.34 7.35 23 12 23z"/>
                  </svg>
                )}
                <span>{isLoggingIn ? 'Connecting to Firebase Auth...' : 'Continue with Google'}</span>
              </button>

              <p className="text-[10px] text-center text-gray-400">
                Civic AI utilizes Firebase Authentication and role custom claims to safeguard government records and private citizen data.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Smarter Governance, Faster Action</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Leveraging Google Cloud and Gemini AI to bridge the gap between citizens and officials.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="text-blue-500" />}
              title="AI Analysis"
              description="Automatically categorize and prioritize issues using advanced computer vision and natural language processing."
            />
            <FeatureCard
              icon={<MapIcon className="text-indigo-500" />}
              title="Geo-Intelligence"
              description="Real-time heatmaps and duplicate detection to help departments allocate resources where they are needed most."
            />
            <FeatureCard
              icon={<BarChart className="text-violet-500" />}
              title="Impact Dashboards"
              description="Transparent reporting on resolution times, department performance, and community satisfaction."
            />
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl font-black text-gray-900 mb-6">Built on Foundation of Trust</h2>
              <ul className="space-y-4">
                {[
                  "Secure Authentication via Firebase Auth",
                  "Encrypted Media Storage in Google Cloud",
                  "Transparent Audit Logs for every action",
                  "Community Verification & Anti-Spam protection"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="text-green-500 flex-shrink-0" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 bg-gray-100 aspect-square rounded-3xl overflow-hidden relative">
               <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                 <Shield size={120} />
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
