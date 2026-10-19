import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import MapComponent from '../components/MapComponent';
import { auth, db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Power, MapPin, Navigation, History, Check, X, Car, DollarSign } from 'lucide-react';

export default function DriverPage() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 6.5244, lng: 3.3792 });

  // Sync online status with Firestore
  useEffect(() => {
    if (!user || !auth.currentUser) return;
    const updateStatus = async () => {
      await setDoc(doc(db, 'drivers', user.uid), {
        userId: user.uid,
        isAvailable: isOnline,
        currentLocation: currentLocation,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    };
    updateStatus();
  }, [isOnline, user, currentLocation]);

  // Listen to pending rides
  useEffect(() => {
    if (!user || !auth.currentUser || !isOnline) {
      setPendingRides([]);
      return;
    }
    const q = query(collection(db, 'rides'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingRides(rides);
    }, (err) => {
      console.error("Pending rides listener error:", err);
    });
    return () => unsubscribe();
  }, [isOnline, user]);

  // Listen to assigned ride
  useEffect(() => {
    if (!user || !auth.currentUser) return;
    const q = query(
      collection(db, 'rides'), 
      where('driverId', '==', user.uid),
      where('status', 'in', ['accepted', 'ongoing'])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveRide({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setActiveRide(null);
      }
    }, (err) => {
      console.error("Active ride listener error:", err);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAcceptRide = async (rideId: string) => {
    await updateDoc(doc(db, 'rides', rideId), {
      status: 'accepted',
      driverId: user.uid,
      driverName: user.name,
      updatedAt: serverTimestamp(),
    });
  };

  const handleUpdateStatus = async (status: 'ongoing' | 'completed') => {
    if (!activeRide) return;
    await updateDoc(doc(db, 'rides', activeRide.id), {
      status: status,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] flex flex-col gap-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 flex-shrink-0">
         <StatCard label="Earnings" value="₦4,200" icon={<DollarSign className="w-4 h-4 text-emerald-500" />} />
         <StatCard label="Rides" value="8" icon={<Car className="w-4 h-4 text-blue-500" />} />
         <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl px-6 py-4 flex items-center justify-between h-24">
            <div>
               <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1 tracking-wider">Shift Status</p>
               <p className="font-bold text-lg">{isOnline ? 'Online' : 'Offline'}</p>
            </div>
            <button 
               onClick={() => setIsOnline(!isOnline)}
               className={`w-14 h-8 rounded-full relative transition-colors ${isOnline ? 'bg-orange-500' : 'bg-neutral-800'} border border-neutral-700`}
            >
               <motion.div 
                  animate={{ x: isOnline ? 28 : 4 }}
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg" 
               />
            </button>
         </div>
      </div>

      <div className="flex-1 relative rounded-3xl overflow-hidden border border-neutral-800">
        <MapComponent 
          center={currentLocation}
          markers={[
            { position: currentLocation, title: "Your Location", type: 'driver' },
            ...(activeRide ? [
               { position: activeRide.pickupLocation, title: "Pickup", type: 'pickup' as const },
               { position: activeRide.destination, title: "Destination", type: 'destination' as const }
            ] : [])
          ]}
        />

        {/* Requests List */}
        <AnimatePresence>
          {isOnline && !activeRide && pendingRides.length > 0 && (
            <div className="absolute inset-x-4 bottom-4 md:left-4 md:right-auto md:w-96 flex flex-col gap-4 overflow-y-auto max-h-[60%] pb-4 z-20">
               {pendingRides.map(ride => (
                  <motion.div 
                    key={ride.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-xl font-bold">₦{ride.fare}</p>
                          <p className="text-xs text-neutral-400 font-medium">Rider: {ride.riderName}</p>
                       </div>
                       <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-orange-500 uppercase">
                          New Request
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="flex items-start gap-4">
                          <div className="bg-blue-500/20 p-2 rounded-lg mt-0.5">
                            <MapPin className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider leading-none mb-1">Pickup</p>
                            <p className="text-sm font-bold tracking-tight">{ride.pickupLocation.address}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4">
                          <div className="bg-emerald-500/20 p-2 rounded-lg mt-0.5">
                            <Navigation className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider leading-none mb-1">Destination</p>
                            <p className="text-sm font-bold tracking-tight">{ride.destination.address}</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                       <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAcceptRide(ride.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white h-14 rounded-2xl font-bold shadow-lg shadow-orange-500/20 transition-all"
                       >
                          Accept
                       </motion.button>
                       <motion.button 
                        whileTap={{ scale: 0.95 }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white h-14 rounded-2xl font-bold transition-all"
                       >
                          Decline
                       </motion.button>
                    </div>
                  </motion.div>
               ))}
            </div>
          )}
        </AnimatePresence>

        {/* Active Ride Control */}
        {activeRide && (
           <div className="absolute inset-x-4 bottom-4 md:left-4 md:right-auto md:w-96 z-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl"
              >
                 <div className="flex items-center justify-between mb-6">
                    <div>
                       <span className="text-[10px] uppercase font-bold text-orange-500 mb-1 block">Active Trip</span>
                       <h3 className="text-lg font-bold">{activeRide.status === 'accepted' ? 'Go to Pickup' : 'Heading to Destination'}</h3>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-500 uppercase">
                       ₦{activeRide.fare}
                    </div>
                 </div>

                 <div className="space-y-4 mb-8">
                    <div className={`p-4 rounded-2xl ${activeRide.status === 'accepted' ? 'bg-blue-500/10 border border-blue-500/20' : 'opacity-40 bg-neutral-800/50'}`}>
                       <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1 tracking-wider">Pickup</p>
                       <p className="text-sm font-bold">{activeRide.pickupLocation.address}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${activeRide.status === 'ongoing' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'opacity-40 bg-neutral-800/50'}`}>
                       <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1 tracking-wider">Destination</p>
                       <p className="text-sm font-bold">{activeRide.destination.address}</p>
                    </div>
                 </div>

                 <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUpdateStatus(activeRide.status === 'accepted' ? 'ongoing' : 'completed')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-16 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20"
                 >
                    {activeRide.status === 'accepted' ? 'Start Ride' : 'Complete Trip'}
                 </motion.button>
              </motion.div>
           </div>
        )}
      </div>

      {/* Empty State */}
      {!isOnline && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-neutral-950/70 backdrop-blur-md rounded-3xl border border-neutral-800">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 p-8 rounded-[40px] border border-neutral-800 text-center max-w-xs shadow-2xl relative overflow-hidden"
           >
              <div className="w-20 h-20 bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 relative z-10">
                 <Power className="w-10 h-10 text-neutral-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 relative z-10 serif tracking-tight">Shift Offline</h3>
              <p className="text-sm text-neutral-500 mb-8 font-medium relative z-10 leading-relaxed px-2">Turn on Driving Mode to start receiving ride requests from students on campus.</p>
              <button 
                onClick={() => {
                  if (user?.verified) {
                    setIsOnline(true);
                  } else {
                    alert("Your account must be verified by an admin before you can go online.");
                  }
                }}
                className={`w-full font-bold h-14 rounded-2xl transition-all relative z-10 shadow-lg ${user?.verified ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
              >
                 {user?.verified ? "Go Online Now" : "Verification Required"}
              </button>
           </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 flex flex-col justify-between h-24">
      <div className="flex justify-between items-start">
        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 bg-neutral-800 rounded-xl flex items-center justify-center border border-neutral-700 shadow-inner">
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
