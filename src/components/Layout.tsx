import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Car, MapPin, History, User, LogOut, ShieldCheck, ChevronRight, X, Menu } from 'lucide-react';

export function Layout() {
  const { user, setMockUser } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = () => {
    setMockUser(null);
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-72 bg-neutral-900 border-r border-neutral-800 flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">RideOn</span>
        </div>

        <div className="mb-8">
          <Link 
            to="/app/rider" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-between group transition-all shadow-xl shadow-orange-500/10"
          >
            <span>Book a Ride</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem to="/app" icon={<ShieldCheck className="w-5 h-5" />} label="Dashboard" />
          <NavItem to="/app/rider" icon={<MapPin className="w-5 h-5" />} label="Find Ride" />
          {user?.role === 'driver' && (
            <NavItem to="/app/driver" icon={<Car className="w-5 h-5" />} label="Driver Mode" />
          )}
          {user?.role === 'admin' && (
            <NavItem to="/app/admin" icon={<History className="w-5 h-5" />} label="Admin Controls" />
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-neutral-800">
          <div className="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center border border-neutral-600">
                <User className="w-5 h-5 text-neutral-300" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-white">{user?.name}</p>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-white text-lg">RideOn</span>
          </div>
          
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700"
          >
            {isProfileOpen ? <X className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Profile Dropdown */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-neutral-900 border-b border-neutral-800 sticky top-[68px] z-40"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
                    <User className="w-7 h-7 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user?.name}</h3>
                    <p className="text-sm text-neutral-500 italic">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider">
                      {user?.role} Account
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-between p-4 bg-neutral-800 rounded-2xl text-red-400 font-bold"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto pb-32 md:pb-12 h-full">
          <Outlet />
        </div>

        {/* Mobile Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-2xl border-t border-neutral-800 px-8 py-5 flex justify-between items-center z-50">
           <MobileNavItem to="/app" icon={<ShieldCheck />} label="Home" />
           <MobileNavItem to="/app/rider" icon={<MapPin />} label="Ride" />
           {user?.role === 'driver' && <MobileNavItem to="/app/driver" icon={<Car />} label="Drive" />}
           {user?.role === 'admin' && <MobileNavItem to="/app/admin" icon={<History />} label="Admin" />}
        </nav>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-2xl transition-all group"
    >
      <span className="group-hover:text-orange-500 transition-colors">{icon}</span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
      <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function MobileNavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 text-neutral-500 hover:text-orange-500 transition-all group active:scale-95">
      <span className="group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: 22 })}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </Link>
  );
}

