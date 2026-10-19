import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Car, MapPin, History, CreditCard, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 italic serif">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-neutral-400 text-sm md:text-base">Where are we going today?</p>
      </header>
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
                  {user?.role === 'driver' ? "Start Driving" : "Request a Ride"}
                </h2>
                <p className="text-orange-100/90 text-xs md:text-sm max-w-[240px]">
                  {user?.role === 'driver' 
                    ? "Go online to start receiving ride requests from students." 
                    : "Find the nearest student driver on campus and get moving."}
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
            value="12" 
            bgColor="bg-blue-500/10" 
           />
           <StatusCard 
            icon={<Star className="w-5 h-5 text-yellow-400" />} 
            label="Rating" 
            value={user?.rating?.toString() || "5.0"} 
            bgColor="bg-yellow-500/10" 
           />
           <StatusCard 
            icon={<CreditCard className="w-5 h-5 text-emerald-400" />} 
            label="Wallet" 
            value="₦2,500" 
            bgColor="bg-emerald-500/10" 
            className="hidden lg:flex"
           />
           <StatusCard 
            icon={<ShieldCheck className="w-5 h-5 text-purple-400" />} 
            label="Status" 
            value={user?.verified ? "Verified" : "Pending"} 
            bgColor="bg-purple-500/10" 
            className="hidden lg:flex"
           />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent History</h2>
          <Link to="/app/history" className="text-sm text-neutral-500 hover:text-white transition-colors">See all</Link>
        </div>
        <div className="bg-neutral-900 rounded-3xl border border-neutral-800 divide-y divide-neutral-800 overflow-hidden">
          <HistoryItem 
            to="Library" 
            from="Hostel A" 
            date="Today, 2:30 PM" 
            fare="₦200" 
            status="completed" 
          />
          <HistoryItem 
            to="Auditorium" 
            from="Gate" 
            date="Yesterday, 9:00 AM" 
            fare="₦350" 
            status="completed" 
          />
        </div>
      </section>

      {user?.role === 'rider' && (
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold mb-1">Become a Driver</h3>
            <p className="text-sm text-neutral-500">Earn money during your free periods on campus.</p>
          </div>
          <button className="bg-neutral-800 hover:bg-neutral-700 font-medium px-4 py-2 rounded-xl text-sm transition-colors">
            Apply Now
          </button>
        </section>
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
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function HistoryItem({ to, from, date, fare, status }: any) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-neutral-500" />
        </div>
        <div>
          <p className="font-medium">{to}</p>
          <p className="text-xs text-neutral-500">From {from} • {date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">{fare}</p>
        <span className="text-[10px] uppercase font-bold text-emerald-500">{status}</span>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
