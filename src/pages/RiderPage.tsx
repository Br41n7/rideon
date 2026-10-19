import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import MapComponent from '../components/MapComponent';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Navigation, X, Car, Clock, CreditCard, Star, Shield } from 'lucide-react';

export default function RiderPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<'selecting' | 'requesting' | 'waiting' | 'active'>('selecting');
  const [pickup, setPickup] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);

  // Listen to available drivers
  useEffect(() => {
    if (!user || !auth.currentUser) return;
    const q = query(collection(db, 'drivers'), where('isAvailable', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driverList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrivers(driverList);
    }, (err) => {
      console.error("Drivers list error:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen to active ride
  useEffect(() => {
    if (!user || !auth.currentUser) return;
    const q = query(
      collection(db, 'rides'), 
      where('riderId', '==', user.uid),
      where('status', 'in', ['pending', 'accepted', 'ongoing'])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const ride = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
        setActiveRide(ride);
        if (ride.status === 'pending') setStep('requesting');
        else setStep('active');
      } else {
        setActiveRide(null);
        if (step !== 'selecting') setStep('selecting');
      }
    }, (err) => {
      console.error("Active ride listener error:", err);
    });
    return () => unsubscribe();
  }, [user]);

  const handleRequestRide = async () => {
    if (!pickup || !destination) return;
    
    setStep('requesting');
    try {
      await addDoc(collection(db, 'rides'), {
        riderId: user.uid,
        riderName: user.name,
        pickupLocation: pickup,
        destination: destination,
        status: 'pending',
        fare: 250, // Static for demo, could be calculated
        paymentMethod: 'cash',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
      setStep('selecting');
    }
  };

  const handleCancelRide = async () => {
    if (!activeRide) return;
    await updateDoc(doc(db, 'rides', activeRide.id), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
    setStep('selecting');
  };

  const setMockPickup = () => {
    setPickup({ address: "Hostel A", lat: 6.5244, lng: 3.3792 });
  };

  const setMockDestination = () => {
    setDestination({ address: "Main Auditiorium", lat: 6.5300, lng: 3.3850 });
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] flex flex-col gap-6">
      <div className="flex-1 relative rounded-3xl overflow-hidden border border-neutral-800">
        <MapComponent 
          center={pickup?.lat ? { lat: pickup.lat, lng: pickup.lng } : undefined}
          markers={[
            ...(pickup ? [{ position: { lat: pickup.lat, lng: pickup.lng }, title: "Pickup", type: 'pickup' as const }] : []),
            ...(destination ? [{ position: { lat: destination.lat, lng: destination.lng }, title: "Destination", type: 'destination' as const }] : []),
            ...drivers.map(d => ({ 
              position: d.currentLocation, 
              title: "Driver", 
              type: 'driver' as const 
            }))
          ]}
        />

        {/* Search Overlay - Bottom Aligned on Mobile */}
        {step === 'selecting' && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl md:max-w-md md:left-4 md:right-auto md:top-4 md:bottom-auto"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Where to?</h3>
              </div>
              <div 
                onClick={setMockPickup}
                className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${pickup ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-neutral-800 border border-transparent'}`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest leading-none mb-1">Pickup Location</p>
                  <p className="text-sm font-bold tracking-tight">{pickup?.address || "Set pickup point"}</p>
                </div>
              </div>

              <div 
                onClick={setMockDestination}
                className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${destination ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-neutral-800 border border-transparent'}`}
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest leading-none mb-1">Destination</p>
                  <p className="text-sm font-bold tracking-tight">{destination?.address || "Enter destination"}</p>
                </div>
              </div>

              {pickup && destination && (
                <motion.button 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRequestRide}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 rounded-2xl shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2 group mt-2"
                >
                  <span className="text-lg">Confirm Request</span> 
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                  <span className="text-lg">₦250</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Searching Overlay */}
        {step === 'requesting' && (
          <div className="absolute inset-x-4 bottom-4 md:left-auto md:right-4 md:w-96 flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <Car className="w-10 h-10 text-orange-500" />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-orange-500/20 rounded-full" 
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">Finding your ride...</h3>
                <p className="text-sm text-neutral-400 mb-6 px-4">Connecting you with the nearest student driver on campus.</p>
                <button 
                  onClick={handleCancelRide}
                  className="text-neutral-500 text-sm font-medium hover:text-red-500 flex items-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel Request
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Active Ride Overlay */}
        {step === 'active' && activeRide && (
          <div className="absolute inset-x-4 bottom-4 md:left-auto md:right-4 md:w-96 flex flex-col gap-4">
             <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-orange-500 mb-1 block">Ride In Progress</span>
                  <h3 className="text-lg font-bold">{activeRide.status === 'accepted' ? 'Driver is coming' : 'En route'}</h3>
                </div>
                <button 
                  onClick={() => alert("SOS Alert Sent to Campus Security!")}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-red-500/30 flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" /> SOS
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-2xl mb-6">
                 <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden">
                    {/* Placeholder for driver photo */}
                    <div className="bg-neutral-600 w-full h-full flex items-center justify-center">
                       <Car className="w-6 h-6 text-neutral-400" />
                    </div>
                 </div>
                 <div className="flex-1">
                    <p className="font-bold">Student Driver</p>
                    <div className="flex items-center gap-1">
                       <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                       <span className="text-xs text-neutral-400 font-medium">4.9 • Toyota Corolla • ABC-123</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-neutral-800 flex items-center gap-3 p-3 rounded-2xl">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <div>
                       <p className="text-[10px] text-neutral-500 font-bold uppercase">ETA</p>
                       <p className="text-sm font-bold">4 mins</p>
                    </div>
                 </div>
                 <div className="bg-neutral-800 flex items-center gap-3 p-3 rounded-2xl">
                    <CreditCard className="w-4 h-4 text-neutral-400" />
                    <div>
                       <p className="text-[10px] text-neutral-500 font-bold uppercase">Fare</p>
                       <p className="text-sm font-bold">₦250</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
