import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, GraduationCap, MapPin } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'rider' | 'driver'>('rider');
  const navigate = useNavigate();
  const { setMockUser } = useAuth();

  const handleMockLogin = (role: 'rider' | 'driver' | 'admin') => {
    const mockUserData = {
      uid: `mock_${role}_id`,
      name: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@example.edu`,
      role: role,
      verified: true,
      rating: 5,
      isMock: true
    };
    setMockUser(mockUserData);
    navigate('/app');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Validate school email
      if (!user.email?.endsWith('.edu') && !user.email?.includes('student')) {
         // In a real app we'd be stricter, but for demo let's just warn or allow common student keywords
         // setError("Please use your student email address.");
         // return;
      }

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Initial setup - use selected role
        const isAdminEmail = user.email === 'iyanuolalegan@gmail.com';
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: isAdminEmail ? 'admin' : selectedRole,
          verified: isAdminEmail, // Admin starts verified, others don't
          rating: 5,
          createdAt: serverTimestamp(),
        });
      }

      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-[32px] p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter serif italic">CampusRide</span>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-neutral-500 text-center mb-8 font-medium">Join the campus mobility network</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Role Selector */}
        <div className="bg-neutral-800/50 p-1.5 rounded-2xl border border-neutral-800 mb-8 flex relative">
           <motion.div 
             layoutId="role-bg"
             className="absolute inset-y-1.5 rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20"
             initial={false}
             animate={{ 
               left: selectedRole === 'rider' ? '6px' : '50%',
               right: selectedRole === 'rider' ? '50%' : '6px' 
             }}
             transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
           />
           <button 
             onClick={() => setSelectedRole('rider')}
             className={`flex-1 py-3 text-sm font-bold z-10 transition-colors ${selectedRole === 'rider' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
           >
             Join as Rider
           </button>
           <button 
             onClick={() => setSelectedRole('driver')}
             className={`flex-1 py-3 text-sm font-bold z-10 transition-colors ${selectedRole === 'driver' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
           >
             Join as Driver
           </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-black font-bold h-14 rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all disabled:opacity-50 shadow-xl shadow-white/5 active:scale-95"
          >
            {loading ? "Connecting..." : (
              <>
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale" alt="Google" />
                Sign in with Google
              </>
            )}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-neutral-900 px-4 text-neutral-500 font-bold tracking-widest">Development Mode</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleMockLogin('rider')}
              className="w-full bg-neutral-800/50 hover:bg-neutral-800 text-white font-medium h-12 rounded-xl border border-neutral-700 transition-all"
            >
              Mock Rider Login
            </button>
            <button
              onClick={() => handleMockLogin('driver')}
              className="w-full bg-neutral-800/50 hover:bg-neutral-800 text-white font-medium h-12 rounded-xl border border-neutral-700 transition-all"
            >
              Mock Driver Login (Verified)
            </button>
            <button
              onClick={() => handleMockLogin('admin')}
              className="w-full bg-neutral-800/50 hover:bg-neutral-800 text-white font-medium h-12 rounded-xl border border-neutral-700 transition-all"
            >
              Mock Admin Login
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 border-t border-neutral-800 pt-8">
          <div className="text-center">
            <GraduationCap className="w-5 h-5 text-neutral-500 mx-auto mb-2" />
            <span className="text-[10px] text-neutral-600 uppercase font-medium tracking-wider">Student Verified</span>
          </div>
          <div className="text-center">
            <MapPin className="w-5 h-5 text-neutral-500 mx-auto mb-2" />
            <span className="text-[10px] text-neutral-600 uppercase font-medium tracking-wider">Campus Wide</span>
          </div>
          <div className="text-center">
            <Car className="w-5 h-5 text-neutral-500 mx-auto mb-2" />
            <span className="text-[10px] text-neutral-600 uppercase font-medium tracking-wider">Secure Rides</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
