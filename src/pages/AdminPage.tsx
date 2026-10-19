import React from 'react';
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Shield, User, Car, Clock, Check, X, AlertCircle, Search, TrendingUp, Users, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useAuth } from '../hooks/useAuth';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'users' | 'rides' | 'analytics'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = {
    totalRevenue: rides.reduce((acc, r) => acc + (r.status === 'completed' ? (Number(r.fare) || 0) : 0), 0),
    activeRides: rides.filter(r => ['accepted', 'ongoing', 'requested'].includes(r.status)).length,
    totalUsers: users.length,
    verifiedDrivers: users.filter(u => u.role === 'driver' && u.verified).length,
    pendingVerifications: users.filter(u => u.verified === false).length,
  };

  const chartData = [
    { name: 'Mon', rides: 12 },
    { name: 'Tue', rides: 19 },
    { name: 'Wed', rides: 15 },
    { name: 'Thu', rides: 22 },
    { name: 'Fri', rides: 30 },
    { name: 'Sat', rides: 25 },
    { name: 'Sun', rides: 18 },
  ];

  useEffect(() => {
    if (authLoading || !user || !auth.currentUser || user.role !== 'admin') return;

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Users list error:", err);
      if (err.message.includes('permission-denied')) {
        // Suppress list error if not permitted, or show a UI hint
      }
    });
    
    const unsubRides = onSnapshot(collection(db, 'rides'), (snapshot) => {
      setRides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Rides list error:", err);
    });
    
    const unsubDrivers = onSnapshot(collection(db, 'drivers'), (snapshot) => {
      setDrivers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Drivers list error:", err);
    });
    
    return () => { 
      unsubUsers(); 
      unsubRides(); 
      unsubDrivers(); 
    };
  }, [user, authLoading]);

  if (authLoading) return <div className="p-8 text-neutral-400">Loading auth...</div>;
  if (!user || user.role !== 'admin') return <div className="p-8 text-red-500 font-bold">Access Denied. Admins only.</div>;

  const toggleVerification = async (userId: string, current: boolean) => {
    await updateDoc(doc(db, 'users', userId), { verified: !current });
  };

  const deleteUser = async (userId: string) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, 'users', userId));
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRides = rides.filter(r => 
    r.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.pickupLocation?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 serif italic text-white">Admin Hub</h1>
          <p className="text-neutral-500 font-medium">System overview and management console</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-500/5">
             <Shield className="w-4 h-4 text-purple-500" />
             <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Master Authority</span>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <AdminStatCard 
          label="Total Revenue" 
          value={`₦${stats.totalRevenue.toLocaleString()}`} 
          trend="+12%"
          icon={<DollarSign className="text-emerald-500" />} 
          color="emerald"
         />
         <AdminStatCard 
          label="Active Rides" 
          value={stats.activeRides} 
          trend="Live"
          icon={<MapPin className="text-orange-500" />} 
          color="orange"
         />
         <AdminStatCard 
          label="Campus Users" 
          value={stats.totalUsers} 
          trend={`${users.filter(u => u.role === 'student').length} Std`}
          icon={<Users className="text-blue-500" />} 
          color="blue"
         />
         <AdminStatCard 
          label="Verifications" 
          value={stats.pendingVerifications} 
          trend="Required"
          icon={<AlertCircle className="text-yellow-500" />} 
          color="yellow"
         />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-2">
        <div className="flex gap-2">
          <TabButton active={filter === 'users'} onClick={() => setFilter('users')} label="Registry" count={users.length} />
          <TabButton active={filter === 'rides'} onClick={() => setFilter('rides')} label="Operations" count={rides.length} />
          <TabButton active={filter === 'analytics'} onClick={() => setFilter('analytics')} label="Analytics" />
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search database..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl pl-11 pr-6 py-2.5 text-sm focus:border-orange-500 outline-none transition-all w-full md:w-64"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filter === 'users' && (
          <motion.div 
            key="users-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-neutral-900 border border-neutral-800 rounded-[32px] overflow-hidden shadow-2xl"
          >
             {/* Desktop Table View */}
             <div className="hidden md:block overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-neutral-800/30">
                     <tr>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Profile</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Account Type</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Security Status</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] text-right">Utility</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                     {filteredUsers.map((u) => {
                        const driverData = drivers.find((d) => d.userId === u.uid);
                        return (
                          <tr key={u.id} className="hover:bg-neutral-800/20 transition-colors group">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400 border border-neutral-700 shadow-inner group-hover:border-neutral-600 transition-colors">
                                  <User className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-bold text-neutral-200">{u.name}</p>
                                  <p className="text-xs text-neutral-500 font-medium">{u.email}</p>
                                  {u.role === 'driver' && driverData && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <Car className="w-3 h-3 text-orange-500" />
                                      <p className="text-[10px] text-neutral-500 font-bold">
                                        Vehicle: <span className="text-neutral-400">{driverData.vehicleInfo}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                                  u.role === 'driver' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              {u.verified ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 text-[10px] font-bold uppercase tracking-wide">
                                  <Check className="w-3 h-3" />
                                  Active access
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/5 text-yellow-500 border border-yellow-500/10 text-[10px] font-bold uppercase tracking-wide">
                                  <AlertCircle className="w-3 h-3" />
                                  Needs Audit
                                </div>
                              )}
                            </td>
                            <td className="px-8 py-5 text-right space-x-2">
                              <button
                                onClick={() => toggleVerification(u.id, u.verified)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                                  u.verified
                                    ? 'bg-neutral-800 text-neutral-400 hover:bg-red-500/10 hover:text-red-500'
                                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20'
                                }`}
                              >
                                {u.verified ? 'Revoke' : 'Approve'}
                              </button>
                              <button
                                onClick={() => deleteUser(u.id)}
                                className="text-neutral-600 hover:text-red-500 p-2.5 rounded-xl hover:bg-red-500/10 transition-all inline-flex items-center"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                     })}
                  </tbody>
               </table>
             </div>

             {/* Mobile Card View */}
             <div className="md:hidden divide-y divide-neutral-800">
               {filteredUsers.map((u) => {
                 const driverData = drivers.find((d) => d.userId === u.uid);
                 return (
                   <div key={u.id} className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 border border-neutral-700">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold">{u.name}</p>
                            <p className="text-xs text-neutral-500">{u.email}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'driver' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>

                      {u.role === 'driver' && driverData && (
                        <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
                          <Car className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Vehicle</p>
                            <p className="text-xs font-bold text-neutral-200">{driverData.vehicleInfo || "N/A"}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          {u.verified ? (
                            <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                              <Check className="w-3 h-3" /> Approved
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-yellow-500 text-[10px] font-bold uppercase tracking-widest">
                              <AlertCircle className="w-3 h-3" /> Pending
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleVerification(u.id, u.verified)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              u.verified
                                ? 'text-neutral-400 hover:text-red-500'
                                : 'bg-orange-500 text-white'
                            }`}
                          >
                            {u.verified ? 'Revoke' : 'Approve'}
                          </button>
                        </div>
                      </div>
                   </div>
                 );
               })}
             </div>
          </motion.div>
        )}

        {filter === 'rides' && (
          <motion.div 
            key="rides-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
             {filteredRides.length === 0 ? (
               <div className="col-span-full py-20 text-center">
                  <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-neutral-700" />
                  </div>
                  <h3 className="text-white font-bold text-lg">No Operations Found</h3>
                  <p className="text-neutral-500 text-sm">Waiting for live ride activity on campus.</p>
               </div>
             ) : (
               filteredRides.map(r => (
                  <motion.div 
                    layout
                    key={r.id} 
                    className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 shadow-xl relative overflow-hidden group hover:border-neutral-700 transition-colors"
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Session ID</p>
                           <p className="text-sm font-black text-white">#{r.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                          r.status === 'ongoing' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
                        }`}>
                           {r.status}
                        </span>
                     </div>
                     
                     <div className="space-y-4 mb-6 relative">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-800" />
                        <div className="flex items-start gap-4 relative">
                           <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-500 bg-neutral-900 z-10 mt-1" />
                           <div>
                              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider leading-none mb-1">Origin</p>
                              <p className="text-xs font-bold text-neutral-300 leading-snug">{r.pickupLocation?.address}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4 relative">
                           <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 bg-neutral-900 z-10 mt-1" />
                           <div>
                              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider leading-none mb-1">Target</p>
                              <p className="text-xs font-bold text-neutral-300 leading-snug">{r.destination?.address}</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-6 border-t border-neutral-800/80">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center font-black text-xs text-neutral-300 border border-neutral-700">
                              {r.riderName?.[0]}
                           </div>
                           <div>
                              <p className="text-[10px] text-neutral-500 font-bold leading-none mb-1">Rider</p>
                              <span className="text-xs font-bold text-white tracking-tight">{r.riderName}</span>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-neutral-500 font-bold leading-none mb-1 italic serif">Fare</p>
                          <p className="font-black text-white text-lg tracking-tighter">₦{r.fare}</p>
                        </div>
                     </div>
                  </motion.div>
               ))
             )}
          </motion.div>
        )}

        {filter === 'analytics' && (
          <motion.div 
            key="analytics-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Campus Activity</h3>
                    <p className="text-sm text-neutral-500">Ride frequency over the last 7 days</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-2xl border border-neutral-700">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500">+14.2%</span>
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#737373" 
                        fontSize={10} 
                        fontWeight={700}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#737373" 
                        fontSize={10} 
                        fontWeight={700}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#171717', 
                          borderColor: '#262626',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}
                        itemStyle={{ color: '#f97316' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rides" 
                        stroke="#f97316" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRides)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                         <Users className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-xl font-black text-white">{users.filter(u => u.role === 'driver').length}</p>
                         <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Total Fleet Size</p>
                      </div>
                   </div>
                   <ArrowRight className="w-5 h-5 text-neutral-700" />
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                         <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-xl font-black text-white">₦24.5k</p>
                         <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Weekly Payouts</p>
                      </div>
                   </div>
                   <ArrowRight className="w-5 h-5 text-neutral-700" />
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminStatCard({ label, value, trend, icon, color }: any) {
  const colors: any = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 flex flex-col justify-between min-h-[160px] shadow-xl group hover:border-neutral-700 transition-all">
       <div className="flex justify-between items-start">
          <div className={`p-3 rounded-2xl ${colors[color]} border shadow-inner`}>
             {React.cloneElement(icon, { size: 20 })}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg ${colors[color]}`}>
             {trend}
          </span>
       </div>
       <div>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] mb-1">{label}</p>
          <h3 className="text-2xl font-black text-white tracking-tighter">{value}</h3>
       </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }: any) {
   return (
      <button 
        onClick={onClick}
        className={`px-4 py-3 text-sm font-bold transition-all relative ${active ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
      >
        <div className="flex items-center gap-2">
           {label}
           <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-neutral-200 text-black' : 'bg-neutral-800 text-neutral-500'}`}>
              {count}
           </span>
        </div>
        {active && (
           <motion.div 
             layoutId="admin-tab"
             className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" 
           />
        )}
      </button>
   );
}
