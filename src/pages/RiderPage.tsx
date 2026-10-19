import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import MapComponent from '../components/MapComponent';
import RatingReviewModal from '../components/RatingReviewModal';
import { auth, db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  X, 
  Car, 
  Clock, 
  CreditCard, 
  Star, 
  Shield, 
  ShieldCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function RiderPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<'selecting' | 'requesting' | 'waiting' | 'active'>('selecting');
  const [pickup, setPickup] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  // Rating & Review State
  const [reviewRide, setReviewRide] = useState<any>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [unratedRides, setUnratedRides] = useState<any[]>([]);

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
        // If active ride was in progress and now disappeared from active query, it might be completed!
        setActiveRide(null);
        if (step !== 'selecting') setStep('selecting');
      }
    }, (err) => {
      console.error("Active ride listener error:", err);
    });
    return () => unsubscribe();
  }, [user, step]);

  // Listen for completed rides that haven't been rated by rider yet
  useEffect(() => {
    if (!user || !auth.currentUser) return;
    const q = query(
      collection(db, 'rides'),
      where('riderId', '==', user.uid),
      where('status', '==', 'completed')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const completed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const unrated = completed.filter(r => !r.riderReviewedAt);
      setUnratedRides(unrated);

      // Auto-prompt the most recently completed unrated ride if no active ride
      if (unrated.length > 0 && !activeRide && !reviewRide && !isRatingModalOpen) {
        // Sort descending by updatedAt or createdAt if available
        const latest = unrated[0];
        setReviewRide(latest);
        setIsRatingModalOpen(true);
      }
    }, (err) => {
      console.error("Completed rides listener error:", err);
    });

    return () => unsubscribe();
  }, [user, activeRide, reviewRide, isRatingModalOpen]);

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
        fare: 250, // Static for demo
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
    setPickup({ address: "Hostel A - Campus North", lat: 6.5244, lng: 3.3792 });
  };

  const setMockDestination = () => {
    setDestination({ address: "Main Auditorium - Central Block", lat: 6.5300, lng: 3.3850 });
  };

  const openRatingForRide = (ride: any) => {
    setReviewRide(ride);
    setIsRatingModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] flex flex-col gap-6 relative">
      {/* Pending Review Prompt Bar */}
      {unratedRides.length > 0 && !isRatingModalOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">
                You have {unratedRides.length} unrated trip{unratedRides.length > 1 ? 's' : ''}!
              </p>
              <p className="text-[11px] text-neutral-300">
                Rate your driver to maintain safety and build trusted campus drivers.
              </p>
            </div>
          </div>
          <button
            onClick={() => openRatingForRide(unratedRides[0])}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Rate Trip</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

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
            className="absolute bottom-4 left-4 right-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl md:max-w-md md:left-4 md:right-auto md:top-4 md:bottom-auto z-10"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Where to?</h3>
                <span className="text-xs text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                  Campus Quick Ride
                </span>
              </div>
              <div 
                onClick={setMockPickup}
                className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${pickup ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-neutral-800 border border-transparent hover:border-neutral-700'}`}
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
                className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${destination ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-neutral-800 border border-transparent hover:border-neutral-700'}`}
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
          <div className="absolute inset-x-4 bottom-4 md:left-auto md:right-4 md:w-96 flex flex-col gap-4 z-10">
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
                <p className="text-sm text-neutral-400 mb-6 px-4">
                  Connecting you with a verified student driver near {pickup?.address || 'campus'}.
                </p>
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
          <div className="absolute inset-x-4 bottom-4 md:left-auto md:right-4 md:w-96 flex flex-col gap-4 z-10">
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
                  onClick={() => alert("SOS Alert Sent to Campus Security! Dispatch contacted.")}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border border-red-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" /> Emergency SOS
                </button>
              </div>

              {/* Driver Safety & Trust Profile Card */}
              <div className="p-4 bg-neutral-800/70 border border-neutral-700/60 rounded-2xl mb-5 space-y-3">
                 <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                       <Car className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-1.5">
                         <p className="font-bold text-sm truncate">{activeRide.driverName || 'Student Driver'}</p>
                         <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                       </div>
                       <div className="flex items-center gap-1 text-xs text-neutral-300 mt-0.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-amber-400">{activeRide.driverRating || '4.9'}</span>
                          <span className="text-neutral-500">•</span>
                          <span className="text-neutral-400 truncate">{activeRide.vehicleInfo || 'Campus Certified Driver'}</span>
                       </div>
                    </div>
                 </div>

                 {/* Praise tags badge */}
                 <div className="flex flex-wrap gap-1.5 pt-1 border-t border-neutral-700/40">
                   <span className="text-[10px] bg-neutral-700/60 text-neutral-300 px-2 py-0.5 rounded-md font-medium">
                     🛡️ Safe Driving
                   </span>
                   <span className="text-[10px] bg-neutral-700/60 text-neutral-300 px-2 py-0.5 rounded-md font-medium">
                     ✨ Top Quality
                   </span>
                   <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-medium border border-emerald-500/20">
                     Verified Student
                   </span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="bg-neutral-800/90 flex items-center gap-3 p-3 rounded-2xl border border-neutral-700/40">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <div>
                       <p className="text-[10px] text-neutral-400 font-bold uppercase">Status</p>
                       <p className="text-sm font-bold capitalize">{activeRide.status}</p>
                    </div>
                 </div>
                 <div className="bg-neutral-800/90 flex items-center gap-3 p-3 rounded-2xl border border-neutral-700/40">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <div>
                       <p className="text-[10px] text-neutral-400 font-bold uppercase">Fare</p>
                       <p className="text-sm font-bold">₦{activeRide.fare || 250}</p>
                    </div>
                 </div>
              </div>

              {/* End / Complete Ride Trigger for Demo Testing */}
              <button
                onClick={() => {
                  updateDoc(doc(db, 'rides', activeRide.id), {
                    status: 'completed',
                    updatedAt: serverTimestamp(),
                  });
                  openRatingForRide(activeRide);
                }}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-neutral-700 flex items-center justify-center gap-1.5"
              >
                <span>Simulate Trip Arrival & Review</span>
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Post-Ride Rating & Review Modal for Rider */}
      {reviewRide && (
        <RatingReviewModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setReviewRide(null);
          }}
          ride={reviewRide}
          currentUser={{
            uid: user?.uid || 'guest_rider',
            name: user?.name || 'Student Rider',
            role: 'rider',
          }}
          mode="rider"
          onSubmitted={() => {
            setUnratedRides(prev => prev.filter(r => r.id !== reviewRide.id));
          }}
        />
      )}
    </div>
  );
}
