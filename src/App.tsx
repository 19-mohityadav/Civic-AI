/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, cloneElement, ReactElement } from 'react';
import Landing from './components/Landing';
import ReportIssue from './components/ReportIssue';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PlusSquare, LayoutDashboard, Settings, User, Bell, LogOut } from 'lucide-react';
import { cn } from './lib/utils';
import { mockIssues } from './data/mockIssues';
import { Issue } from './types';
import { auth, onAuthStateChanged, signOut, db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';

type View = 'LANDING' | 'REPORT' | 'DASHBOARD' | 'PROFILE';
type UserRole = 'CITIZEN' | 'OFFICER';

const HASH_MAP: Record<string, View> = {
  '#/': 'LANDING',
  '#/auth': 'LANDING',
  '#/dashboard': 'DASHBOARD',
  '#/report': 'REPORT',
  '#/profile': 'PROFILE',
};

export default function App() {
  const [view, setView] = useState<View>('LANDING');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('CITIZEN');
  const [userName, setUserName] = useState('John Citizen');
  const [userEmail, setUserEmail] = useState('test@gmail.com');
  const [userAvatar, setUserAvatar] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [hash, setHash] = useState(window.location.hash || '#/');

  // Real-time Firestore synchronizer
  useEffect(() => {
    if (!isAuthenticated) {
      setIssues([]); // Reset issues on sign out
      return;
    }
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const list: Issue[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Issue);
        });
        setIssues(list);
      } else {
        // Seed initial mock issues into Firestore
        mockIssues.forEach(async (issue) => {
          try {
            await setDoc(doc(db, "issues", issue.id), issue);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `issues/${issue.id}`);
          }
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "issues");
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleAddIssue = async (newIssue: Issue) => {
    try {
      await setDoc(doc(db, "issues", newIssue.id), newIssue);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `issues/${newIssue.id}`);
    }
  };

  // Listen to hash change to drive the router state natively
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    // Initialize default route
    if (!window.location.hash) {
      window.location.hash = '#/';
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        const storedRole = localStorage.getItem('civic_user_role') as UserRole || 'CITIZEN';
        setUserRole(storedRole);
        setUserName(user.displayName || 'Anonymous User');
        setUserEmail(user.email || '');
        setUserAvatar(user.photoURL || '');
      } else {
        setIsAuthenticated(false);
        setUserRole('CITIZEN');
        setUserName('John Citizen');
        setUserEmail('yadavmohit85692@gmail.com');
        setUserAvatar('');
      }
    });
    return () => unsubscribe();
  }, []);

  // Secure Route & Guard Synchronizer
  useEffect(() => {
    const targetView = HASH_MAP[hash] || 'LANDING';

    if (!isAuthenticated) {
      // Auth Guard: If guest, force landing/auth
      if (targetView !== 'LANDING') {
        window.location.hash = '#/auth';
      } else if (view !== 'LANDING') {
        setView('LANDING');
      }
    } else {
      // Authenticated Guard: If user is logged in, do not show Landing/Auth
      if (targetView === 'LANDING') {
        window.location.hash = '#/dashboard';
      } else if (view !== targetView) {
        setView(targetView);
      }
    }
  }, [hash, isAuthenticated, view]);

  const handleStart = (role: UserRole, name: string, email: string, avatarUrl?: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    if (avatarUrl) {
      setUserAvatar(avatarUrl);
    }
    window.location.hash = '#/dashboard';
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('civic_user_role');
    } catch (err) {
      console.error("Firebase SignOut failed:", err);
    }
    window.location.hash = '#/auth';
  };

  if (view === 'LANDING') {
    return <Landing onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-100 flex flex-col items-center lg:items-stretch py-8 z-50">
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">C</div>
          <span className="hidden lg:block font-black text-xl text-gray-900 tracking-tight">Civic AI</span>
        </div>

        <nav className="flex-1 space-y-2 px-3">
          <NavItem
            icon={<LayoutDashboard />}
            label={userRole === 'OFFICER' ? "Officer Console" : "Dashboard"}
            active={view === 'DASHBOARD'}
            onClick={() => { window.location.hash = '#/dashboard'; }}
          />
          {userRole === 'CITIZEN' && (
            <NavItem
              icon={<PlusSquare />}
              label="Report Issue"
              active={view === 'REPORT'}
              onClick={() => { window.location.hash = '#/report'; }}
            />
          )}
          <NavItem
            icon={<Bell />}
            label="Notifications"
            active={false}
          />
          <NavItem
            icon={<User />}
            label="My Profile"
            active={view === 'PROFILE'}
            onClick={() => { window.location.hash = '#/profile'; }}
          />
        </nav>

        <div className="px-3 space-y-2">
          <NavItem icon={<Settings />} label="Settings" active={false} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold"
          >
            <LogOut size={24} />
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="text-xl font-bold text-gray-900">
            {view === 'DASHBOARD' 
              ? (userRole === 'OFFICER' ? 'Municipality Management Console' : 'Community Feed') 
              : view === 'REPORT' ? 'Submit Report' : 'My Account'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-blue-700 capitalize">{userRole.toLowerCase()} Mode</span>
            </div>
            <div className="h-8 w-px bg-gray-100 mx-2" />
             <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-sm font-bold text-gray-700 block">{userName}</span>
                <span className="text-[10px] text-gray-400 block font-medium">{userEmail}</span>
              </div>
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt="Google Avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {userName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'DASHBOARD' && (
                <Dashboard 
                  userRole={userRole} 
                  issues={issues} 
                  setIssues={setIssues} 
                />
              )}
              {view === 'REPORT' && (
                <div className="py-12">
                  <ReportIssue 
                    onReported={() => { window.location.hash = '#/dashboard'; }} 
                    onAddIssue={handleAddIssue}
                    reporterName={userName}
                    reporterId={userEmail}
                  />
                </div>
              )}
              {view === 'PROFILE' && (
                <div className="max-w-4xl mx-auto p-8 text-center text-gray-400 py-20 space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt="Google Avatar" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl mx-auto"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto">
                        {userName.charAt(0)}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-1 bg-green-500 border-2 border-white w-5 h-5 rounded-full block" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{userName}</h3>
                    <p className="text-sm text-gray-400 font-medium">{userEmail}</p>
                    <div className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full capitalize">
                      {userRole.toLowerCase()} Account
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-3xl p-6 max-w-md mx-auto text-left border border-gray-100 shadow-sm space-y-4">
                    <h4 className="font-bold text-gray-800 text-sm">Google Integration Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Auth Method</span>
                        <span className="font-bold text-gray-700 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          Google OAuth / Firebase
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Account Type</span>
                        <span className="font-bold text-gray-700 uppercase">{userRole}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Workspace Tenant</span>
                        <span className="font-bold text-gray-700">gmail.com</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl max-w-sm mx-auto text-xs text-gray-500">
                    Your citizen or officer account is fully integrated with Google Identity.
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactElement, label: string, active: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold group",
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {cloneElement(icon, { size: 24 } as any)}
      <span className="hidden lg:block">{label}</span>
    </button>
  );
}

