import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Car, MapPin, Shield, Clock, ChevronRight, GraduationCap, Users, Star, ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500 selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20"
            >
              <Car className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl sm:text-2xl font-bold tracking-tighter serif italic">CampusRide</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">How it Works</a>
            <a href="#safety" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Safety</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to={user ? "/app" : "/login"} 
              className="px-5 sm:px-8 py-2.5 bg-white text-black rounded-full text-xs sm:text-sm font-black uppercase tracking-tight hover:bg-neutral-200 transition-all flex items-center gap-2 group shadow-xl shadow-white/5"
            >
              {user ? 'Dashboard' : 'Sign In'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 px-4 sm:px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div 
            style={{ y: y1, opacity }}
            className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-square bg-orange-500/10 blur-[120px] rounded-full"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-8 backdrop-blur-md">
                  <GraduationCap className="w-4 h-4" />
                  The New Standard of Campus Mobility
                </div>
                <h1 className="text-6xl sm:text-8xl md:text-[120px] leading-[0.82] font-black tracking-tighter serif mb-10">
                  RIDE THE <br />
                  <span className="italic text-orange-500">FUTURE.</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-neutral-400 max-w-xl mb-12 leading-relaxed font-medium">
                  Connect with peer-verified student drivers for premium, safe, and frictionless rides across campus.
                </p>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link 
                    to="/login" 
                    className="px-10 py-5 bg-orange-500 text-white rounded-[24px] text-lg font-black uppercase tracking-tight hover:bg-orange-600 transition-all shadow-2xl shadow-orange-500/20 flex items-center justify-center gap-3 group active:scale-95"
                  >
                    Start Moving
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[24px] text-lg font-black uppercase tracking-tight hover:bg-white/10 transition-all backdrop-blur-xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    How it works
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Stunning Animation Video Placeholder / Interactive Visual */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1.2, ease: "circOut", delay: 0.2 }}
                className="relative z-10"
              >
                <div className="aspect-[4/5] bg-neutral-900 border border-white/10 rounded-[48px] overflow-hidden relative group">
                  {/* Pseudo-Video Content (Abstract Animation) */}
                  <div className="absolute inset-0 overflow-hidden">
                     <motion.div 
                       animate={{ 
                         backgroundPosition: ["0% 0%", "100% 100%"],
                         scale: [1, 1.1, 1]
                       }}
                       transition={{ 
                         backgroundPosition: { duration: 20, repeat: Infinity, ease: "linear" },
                         scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
                       }}
                       className="absolute inset-0 bg-gradient-to-br from-orange-600/40 via-purple-600/20 to-neutral-900 opacity-60"
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-72 h-72">
                           <motion.div 
                             animate={{ rotate: 360 }}
                             transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                             className="absolute inset-0 rounded-full border border-white/5 border-dashed"
                           />
                           <motion.div 
                             animate={{ rotate: -360 }}
                             transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                             className="absolute inset-4 rounded-full border border-white/10"
                           />
                           <motion.div 
                             animate={{ scale: [1, 1.05, 1], rotate: 45 }}
                             transition={{ duration: 5, repeat: Infinity }}
                             className="absolute inset-10 bg-neutral-900 border border-white/10 rounded-[32px] flex items-center justify-center shadow-2xl"
                           >
                              <Car className="w-16 h-16 text-orange-500" />
                           </motion.div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Notification Mockup (Floating UI) */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 right-10 bg-white/10 backdrop-blur-2xl border border-white/20 p-4 rounded-2xl shadow-2xl w-48"
                  >
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold">JD</div>
                        <div className="h-2 w-16 bg-white/20 rounded-full" />
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full mb-2" />
                     <div className="h-1.5 w-2/3 bg-white/10 rounded-full" />
                  </motion.div>

                  <div className="absolute bottom-10 left-10 right-10">
                    <p className="text-2xl font-black italic serif tracking-tighter mb-2">LIVE TRACKING</p>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="h-full bg-orange-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-orange-500/20 blur-3xl -z-10 rounded-full opacity-50" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 bg-neutral-900/40 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-end">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl sm:text-7xl font-bold tracking-tight serif italic mb-8">PRECISION <br /><span className="text-orange-500">ENGINEERING.</span></h2>
                <p className="text-neutral-500 text-xl font-medium max-w-2xl">We've reconstructed the ride-sharing experience specifically for the complexities of campus life.</p>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              icon={<Shield className="w-8 h-8" />}
              title="Identity Guard"
              description="Rigorous peer verification ensures every driver is a trusted member of your student body."
              delay={0}
            />
            <FeatureCard 
              icon={<Clock className="w-8 h-8" />}
              title="Zero Latency"
              description="Sophisticated routing algorithms minimize wait times during busy lecture changeovers."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Star className="w-8 h-8" />}
              title="Luxury Standard"
              description="CampusRide only accepts clean, well-maintained vehicles for a premium student experience."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Stunning Video/Visual Interstitial */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto h-[400px] sm:h-[600px] rounded-[48px] overflow-hidden relative group border border-white/5 shadow-2xl">
           <div className="absolute inset-0 bg-neutral-900 overflow-hidden">
              {/* This represents a "Stunning Animation Video" */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-20 text-center">
                 <div className="max-w-3xl">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1 }}
                    >
                      <h3 className="text-4xl sm:text-7xl font-bold tracking-tighter mb-8 serif italic">Built to move <br /> the next generation.</h3>
                      <button className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                         <Play className="w-8 h-8 fill-current ml-1" />
                      </button>
                    </motion.div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Safety/Trust Grid */}
      <section id="safety" className="py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 sm:gap-24 items-center">
              <div className="relative">
                 <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full" />
                 <motion.div
                   initial={{ opacity: 0, x: -50 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                 >
                    <h2 className="text-5xl sm:text-7xl font-bold tracking-tight serif italic mb-10 leading-tight">TRUST IS OUR <br /><span className="text-orange-500">CORE FUEL.</span></h2>
                    <div className="space-y-12">
                       <TrustItem 
                        icon={<Users className="text-orange-500" />}
                        title="Peer Accountability"
                        description="Our community-rating system ensures high behavior standards for both riders and drivers."
                       />
                       <TrustItem 
                        icon={<Shield className="text-orange-500" />}
                        title="Active Monitoring"
                        description="CampusRide security specialists monitor every active trip sequence for total peace of mind."
                       />
                    </div>
                 </motion.div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-white/5 border border-white/10 rounded-[64px] relative overflow-hidden flex items-center justify-center p-12">
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 opacity-5"
                   >
                      <img src="https://ais-pre-xuu6wgop7thlyerlewtdak-235467120141.europe-west2.run.app/map-pattern.svg" className="w-full h-full object-cover scale-[1.5]" alt="" />
                   </motion.div>
                   <div className="relative z-10 w-full space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-2xl"
                        >
                           <div className="w-8 h-8 rounded-full bg-orange-500/20" />
                           <div className="h-2 w-full bg-white/5 rounded-full" />
                        </motion.div>
                      ))}
                   </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-4 sm:px-6 border-t border-white/5 bg-neutral-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white italic">C</div>
                <span className="text-2xl font-bold tracking-tighter serif italic text-white uppercase">CampusRide</span>
              </div>
              <p className="text-neutral-500 text-lg font-medium leading-relaxed mb-8">
                The world's most advanced peer-to-peer campus mobility ecosystem.
              </p>
              <div className="flex gap-4">
                 {['X', 'IG', 'LI'].map(social => (
                   <a key={social} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black hover:bg-white hover:text-black transition-all">
                     {social}
                   </a>
                 ))}
              </div>
            </div>
            
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <p className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Platform</p>
                <ul className="space-y-4">
                  <li><Link to="/login" className="text-neutral-500 hover:text-orange-500 transition-colors text-sm font-bold uppercase tracking-tight">Request Ride</Link></li>
                  <li><Link to="/login" className="text-neutral-500 hover:text-orange-500 transition-colors text-sm font-bold uppercase tracking-tight">Drive & Earn</Link></li>
                  <li><Link to="/app" className="text-neutral-500 hover:text-orange-500 transition-colors text-sm font-bold uppercase tracking-tight">Enterprise</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Resources</p>
                <ul className="space-y-4">
                  <li><a href="#" className="text-neutral-500 hover:text-orange-500 transition-colors text-sm font-bold uppercase tracking-tight">Safety Protocol</a></li>
                  <li><a href="#" className="text-neutral-500 hover:text-orange-500 transition-colors text-sm font-bold uppercase tracking-tight">Campus Coverage</a></li>
                  <li><a href="#" className="text-neutral-500 hover:text-orange-500 transition-colors text-sm font-bold uppercase tracking-tight">Press Hub</a></li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Legal</p>
                <ul className="space-y-4">
                  <li><a href="#" className="text-neutral-500 hover:text-orange-500 transition-colors text-sm font-bold uppercase tracking-tight">Privacy Architecture</a></li>
                  <li><a href="#" className="text-neutral-500 hover:text-orange-500 transition-colors text-sm font-bold uppercase tracking-tight">Service Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em]">© 2026 CampusRide Global Ecosystem. All rights reserved.</p>
            <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest italic serif">Engineering the future of university transport.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ y: -12 }}
      className="p-10 bg-neutral-900 border border-white/5 rounded-[40px] hover:border-orange-500/40 hover:bg-neutral-900/60 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-10 border border-white/10 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500/20 transition-all shadow-xl">
        {icon}
      </div>
      <h3 className="text-3xl font-bold mb-5 tracking-tight">{title}</h3>
      <p className="text-neutral-500 leading-relaxed font-medium text-lg">{description}</p>
    </motion.div>
  );
}

function TrustItem({ icon, title, description }: any) {
  return (
    <div className="flex gap-8 group">
       <div className="w-16 h-16 bg-white/5 rounded-[20px] flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all">
          {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8 transition-colors" })}
       </div>
       <div>
         <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
         <p className="text-neutral-400 text-lg font-medium leading-relaxed">{description}</p>
       </div>
    </div>
  );
}
