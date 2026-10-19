import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth, db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Car, MapPin, History, CreditCard, Star, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import RatingReviewModal from '../components/RatingReviewModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [reviewRide, setReviewRide] = useState<any>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  useEffect(() => {
    if (!user || !auth.currentUser) return;

    const isDriver = user.role === 'driver';
    const field = isDriver ? 'driverId' : 'riderId';
    const q = query(
      collection(db, 'rides'),
      where(field, '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setRecentRides(list);
    }, (err) => {
      console.error("Dashboard rides listener error:", err);
    });

    return () => unsubscribe();
  }, [user]);

  const isDriver = user?.role === 'driver';
  const unratedRide = recentRides.find(r => 
    r.status === 'completed' && (isDriver ? !r.driverReviewedAt : !r.riderReviewedAt)
  );

  const completedRidesCount = recentRides.filter(r => r.status === 'completed').length;

  const handleOpenRating = (ride: any) => {
    setReviewRide(ride);
    setIsRatingModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 italic serif">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-neutral-400 text-sm md:text-base">
          {user?.role === 'driver' 
            ? "Your campus driving and earnings headquarters" 
            : "Your trusted intra-campus mobility hub"}
        </p>
      </header>

      {/* Unrated Ride Notice if available */}
      {unratedRide && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 border border-orange-500/40 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/30 text-orange-400 flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 fill-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Rate Recent Trip</span>
                <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-bold">Pending Review</span>
              </div>
              <p className="text-base font-bold text-white mt-0.5">
                {isDriver 
                  ? `How was your passenger, ${unratedRide.riderName || 'Campus Student'}?` 
                  : `How was your ride with ${unratedRide.driverName || 'Student Driver'}?`}
              </p>
              <p className="text-xs text-neutral-300">
                {unratedRide.pickupLocation?.address} → {unratedRide.destination?.address}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenRating(unratedRide)}
            className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 flex-shrink-0 active:scale-95"
          >
            <span>Rate Now</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action: Dynamic based on role */}
        <div className="lg:col-span-2">
          <Link to={user?.role === 'driver' ? "/app/driver" : "/app/rider"} className="group block h-full">
            <motion.div 
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="h-full bg-orange-500 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[200px] md:min-h-[240px] shadow-xl shadow-orange-500/20 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6 backdrop-blur-md">
                  {user?.role === 'driver' ? <Car className="w-6 h-6 md:w-7 md:h-7 text-white" /> : <MapPin className="w-6 h-6 md:w-7 md:h-7 text-white" />}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 serif tracking-tight">
                  {user?.role === 'driver' ? "Start Driving Shift" : "Request a Campus Ride"}
                </h2>
                <p className="text-orange-100/90 text-xs md:text-sm max-w-[280px]">
                  {user?.role === 'driver' 
                    ? "Go online to start receiving ride requests from verified campus students." 
                    : "Find the nearest verified student driver on campus and travel safely."}
                </p>
              </div>
              
              <div className="relative z-10 flex items-center justify-between w-full mt-4">
                <div className="flex items-center gap-2 text-white font-bold px-4 py-2 md:px-6 md:py-3 bg-white/10 rounded-xl md:rounded-2xl backdrop-blur-sm group-hover:bg-white/20 transition-all border border-white/10 text-sm md:text-base">
                  <span>Start Now</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Car className="w-64 h-64 rotate-12" />
              </div>
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
           <StatusCard 
            icon={<History className="w-5 h-5 text-blue-400" />} 
            label="Total Rides" 
            value={completedRidesCount > 0 ? completedRidesCount.toString() : "12"} 
            bgColor="bg-blue-500/10" 
           />
           <StatusCard 
            icon={<Star className="w-5 h-5 text-amber-400 fill-amber-400" />} 
            label="Community Rating" 
            value={user?.rating ? `${Number(user.rating).toFixed(1)} ★` : "5.0 ★"} 
            bgColor="bg-amber-500/10" 
           />
           <StatusCard 
            icon={<CreditCard className="w-5 h-5 text-emerald-400" />} 
            label="Campus Wallet" 
            value={user?.role === 'driver' ? "₦4,200" : "₦2,500"} 
            bgColor="bg-emerald-500/10" 
            className="hidden lg:flex"
           />
           <StatusCard 
            icon={<ShieldCheck className="w-5 h-5 text-purple-400" />} 
            label="ID Verification" 
            value={user?.verified ? "Verified" : "Pending"} 
            bgColor="bg-purple-500/10" 
            className="hidden lg:flex"
           />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent History & Ratings</h2>
          <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
            {recentRides.length} Recorded Trips
          </span>
        </div>

        <div className="bg-neutral-900 rounded-3xl border border-neutral-800 divide-y divide-neutral-800 overflow-hidden">
          {recentRides.length > 0 ? (
            recentRides.slice(0, 5).map(ride => {
              const myRating = isDriver ? ride.driverRating : ride.riderRating;
              const otherRating = isDriver ? ride.riderRating : ride.driverRating;
              const otherName = isDriver ? (ride.riderName || 'Rider') : (ride.driverName || 'Driver');

              return (
                <div 
                  key={ride.id} 
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-400 border border-neutral-700/60">
                      <MapPin className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">
                        {ride.destination?.address || 'Auditorium'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        From {ride.pickupLocation?.address || 'Hostel'} • {otherName}
                      </p>

                      {/* Display rating badges if present */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {myRating ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                            <Star className="w-3 h-3 fill-amber-400" />
                            You rated: {myRating} ★
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenRating(ride)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500 px-2.5 py-1 rounded-lg border border-orange-500/30 transition-all"
                          >
                            <Star className="w-3 h-3" /> Rate Trip
                          </button>
                        )}

                        {otherRating && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-700">
                            Received: {otherRating} ★
                          </span>
                        )}

                        {ride.riderReportedSafety && (
                          <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                            ⚠️ Safety Flagged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 text-right">
                    <div>
                      <p className="font-black text-white text-base">₦{ride.fare || 250}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        ride.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {ride.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <>
              <HistoryItem 
                to="Campus Library" 
                from="Hostel A - North Gate" 
                date="Today, 2:30 PM" 
                fare="₦200" 
                status="completed" 
                rating="5.0 ★"
              />
              <HistoryItem 
                to="Main Auditorium" 
                from="Faculty of Science" 
                date="Yesterday, 9:00 AM" 
                fare="₦350" 
                status="completed" 
                rating="4.8 ★"
              />
            </>
          )}
        </div>
      </section>

      {user?.role === 'rider' && (
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold mb-1 text-white">Become a Student Driver</h3>
            <p className="text-sm text-neutral-400">
              Earn income between lectures while helping fellow students move safely around campus.
            </p>
          </div>
          <Link
            to="/login"
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-5 py-3 rounded-2xl text-xs transition-colors flex items-center justify-center flex-shrink-0"
          >
            Apply to Drive
          </Link>
        </section>
      )}

      {/* Post-Ride Rating & Review Modal */}
      {reviewRide && (
        <RatingReviewModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setReviewRide(null);
          }}
          ride={reviewRide}
          currentUser={{
            uid: user?.uid || 'guest_user',
            name: user?.name || 'Campus Student',
            role: user?.role || 'rider',
          }}
          mode={isDriver ? 'driver' : 'rider'}
        />
      )}
    </div>
  );
}

function StatusCard({ icon, label, value, bgColor, className }: any) {
  return (
    <div className={`p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between ${bgColor} ${className}`}>
      <div className="mb-2">{icon}</div>
      <div>
        <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function HistoryItem({ to, from, date, fare, status, rating }: any) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400">
          <MapPin className="w-5 h-5 text-neutral-500" />
        </div>
        <div>
          <p className="font-medium text-white">{to}</p>
          <p className="text-xs text-neutral-500">From {from} • {date}</p>
          {rating && (
            <span className="text-[10px] font-bold text-amber-400 mt-1 inline-flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" /> {rating}
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-white">{fare}</p>
        <span className="text-[10px] uppercase font-bold text-emerald-500">{status}</span>
      </div>
    </div>
  );
}
