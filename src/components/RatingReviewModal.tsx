import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Shield, 
  AlertTriangle, 
  Check, 
  X, 
  Car, 
  User, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { submitPostRideReview } from '../lib/reviews';

export interface RatingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: {
    id: string;
    riderId: string;
    riderName?: string;
    driverId?: string;
    driverName?: string;
    vehicleInfo?: string;
    fare?: number;
    pickupLocation?: { address: string };
    destination?: { address: string };
  };
  currentUser: {
    uid: string;
    name: string;
    role: string;
  };
  mode: 'rider' | 'driver'; // who is writing the review
  onSubmitted?: () => void;
}

const RIDER_PRAISE_TAGS = [
  'Safe Driving 🛡️',
  'Polite & Respectful 😊',
  'Clean Vehicle ✨',
  'Punctual ⏱️',
  'Smooth Driving 🚗',
  'Great Campus Route 🗺️',
  'Good Music / Vibe 🎵',
  'Helped with Luggage 🎒',
];

const RIDER_CRITICAL_TAGS = [
  'Reckless Driving ⚠️',
  'Speeding on Campus 🛑',
  'Late to Pickup ⏳',
  'Unclean Car 🧹',
  'Rude Attitude 🚫',
  'Phone Distraction 📱',
  'Took Wrong Route 🗺️',
  'Fare Dispute 💳',
];

const DRIVER_PRAISE_TAGS = [
  'Ready at Pickup ⏱️',
  'Polite & Respectful 😊',
  'Left Vehicle Clean ✨',
  'Friendly Student 🎓',
  'Clear Directions 📍',
  'Great Conversation 💬',
];

const DRIVER_CRITICAL_TAGS = [
  'Made Driver Wait >5m ⏳',
  'Disrespectful Conduct 🚫',
  'Messy / Spilled Drink 🥤',
  'Inappropriate Behavior ⚠️',
  'Wrong Pickup Point 🗺️',
];

const SAFETY_CATEGORIES = [
  'Dangerous or Reckless Speeding',
  'Inappropriate or Harassing Conduct',
  'Vehicle Safety Defect / Faulty Seatbelts',
  'Unauthorized Route Diversion',
  'Physical or Verbal Altercation',
  'Fare Extortion / Policy Violation',
  'Other Safety Concern',
];

export default function RatingReviewModal({
  isOpen,
  onClose,
  ride,
  currentUser,
  mode,
  onSubmitted,
}: RatingReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [isSafetyReport, setIsSafetyReport] = useState<boolean>(false);
  const [safetyCategory, setSafetyCategory] = useState<string>(SAFETY_CATEGORIES[0]);
  const [safetyDetails, setSafetyDetails] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen || !ride) return null;

  const targetName = mode === 'rider' ? (ride.driverName || 'Student Driver') : (ride.riderName || 'Campus Passenger');
  const targetRoleTitle = mode === 'rider' ? 'Student Driver' : 'Campus Rider';
  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return { title: 'Outstanding Trip!', desc: 'Exceptional safety, punctuality, and service', color: 'text-amber-400' };
      case 4:
        return { title: 'Good & Smooth', desc: 'Pleasant and safe campus trip', color: 'text-emerald-400' };
      case 3:
        return { title: 'Average Experience', desc: 'Met expectations with minor feedback', color: 'text-yellow-400' };
      case 2:
        return { title: 'Below Expectations', desc: 'Encountered problems or delays', color: 'text-orange-400' };
      case 1:
        return { title: 'Unsatisfactory / Issue', desc: 'Serious safety or quality concerns', color: 'text-red-400' };
      default:
        return { title: 'Select a Rating', desc: 'Tap the stars above to rate', color: 'text-neutral-400' };
    }
  };

  const currentLabel = getRatingLabel(displayRating);

  const availableTags = mode === 'rider'
    ? (displayRating >= 4 ? RIDER_PRAISE_TAGS : RIDER_CRITICAL_TAGS)
    : (displayRating >= 4 ? DRIVER_PRAISE_TAGS : DRIVER_CRITICAL_TAGS);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitPostRideReview({
        rideId: ride.id,
        reviewerId: currentUser.uid,
        reviewerName: currentUser.name || (mode === 'rider' ? 'Campus Rider' : 'Campus Driver'),
        reviewerRole: mode,
        targetUserId: mode === 'rider' ? (ride.driverId || '') : ride.riderId,
        targetUserName: targetName,
        rating,
        tags: selectedTags,
        comment: comment.trim(),
        isSafetyReport,
        safetyCategory: isSafetyReport ? safetyCategory : undefined,
        safetyDetails: isSafetyReport ? safetyDetails.trim() : undefined,
        pickupAddress: ride.pickupLocation?.address || '',
        destinationAddress: ride.destination?.address || '',
      });

      setSubmitted(true);
      if (onSubmitted) onSubmitted();

      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 1600);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 md:p-8 shadow-2xl my-8 overflow-hidden text-white"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute top-6 right-6 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Review Submitted!</h3>
              <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
                Thank you for rating your trip. Your feedback upholds the highest safety and community standards on our campus.
              </p>
              {isSafetyReport && (
                <div className="mt-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>Campus Safety team has been notified of your report.</span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Trip Completed
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight serif italic">
                  How was your {mode === 'rider' ? 'Driver' : 'Passenger'}?
                </h2>
                <p className="text-neutral-400 text-xs md:text-sm">
                  Rate your campus ride to ensure community trust and safety.
                </p>
              </div>

              {/* Target User Card */}
              <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-inner flex-shrink-0">
                  {mode === 'rider' ? <Car className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-base text-white truncate">{targetName}</p>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-neutral-700 text-neutral-300">
                      {targetRoleTitle}
                    </span>
                  </div>
                  {mode === 'rider' && ride.vehicleInfo && (
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{ride.vehicleInfo}</p>
                  )}
                  {ride.pickupLocation && ride.destination && (
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1 truncate">
                      <span className="truncate">{ride.pickupLocation.address}</span>
                      <span>→</span>
                      <span className="truncate">{ride.destination.address}</span>
                    </div>
                  )}
                </div>
                {ride.fare && (
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-neutral-500 font-medium">Fare</span>
                    <p className="font-bold text-orange-400 text-sm">₦{ride.fare}</p>
                  </div>
                )}
              </div>

              {/* Star Rating Section */}
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <div className="flex items-center gap-2 md:gap-3">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= displayRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className="p-1 md:p-2 rounded-xl transition-all duration-150 transform hover:scale-125 active:scale-95 focus:outline-none"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`w-9 h-9 md:w-11 md:h-11 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                              : 'text-neutral-700 hover:text-neutral-500'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-center transition-all min-h-[44px]">
                  <p className={`text-base font-bold ${currentLabel.color}`}>
                    {currentLabel.title}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {currentLabel.desc}
                  </p>
                </div>
              </div>

              {/* Praise / Constructive Tags */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {displayRating >= 4 ? 'What went great?' : 'What could be improved?'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-150 border active:scale-95 ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                            : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:bg-neutral-700/80 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Written Review */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  Write a note (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder={`Tell other campus students about your experience with ${targetName}...`}
                  rows={3}
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-2xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
                <div className="flex justify-end">
                  <span className="text-[11px] text-neutral-500">{comment.length}/500</span>
                </div>
              </div>

              {/* Safety & Incident Reporting Section */}
              <div className="pt-2 border-t border-neutral-800">
                <div 
                  onClick={() => setIsSafetyReport(!isSafetyReport)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors border ${
                    isSafetyReport 
                      ? 'bg-red-500/10 border-red-500/40 text-red-300' 
                      : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className={`w-5 h-5 ${isSafetyReport ? 'text-red-400' : 'text-neutral-500'}`} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white">
                        Report a Safety or Conduct Concern
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Direct escalation to Campus Security & Administrators
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSafetyReport}
                    onChange={(e) => setIsSafetyReport(e.target.checked)}
                    className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                </div>

                <AnimatePresence>
                  {isSafetyReport && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3 mt-3 p-4 bg-red-950/20 border border-red-900/40 rounded-2xl"
                    >
                      <div>
                        <label className="text-[11px] font-bold text-red-300 uppercase tracking-wider block mb-1">
                          Safety Issue Category
                        </label>
                        <select
                          value={safetyCategory}
                          onChange={(e) => setSafetyCategory(e.target.value)}
                          className="w-full bg-neutral-900 border border-red-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          {SAFETY_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-red-300 uppercase tracking-wider block mb-1">
                          Incident Details (Confidential to Campus Admin)
                        </label>
                        <textarea
                          value={safetyDetails}
                          onChange={(e) => setSafetyDetails(e.target.value.slice(0, 500))}
                          placeholder="Please describe what happened in as much detail as possible..."
                          rows={2}
                          className="w-full bg-neutral-900 border border-red-900/60 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 p-2.5 bg-neutral-900/80 rounded-xl text-[11px] text-neutral-300 border border-neutral-800">
                        <PhoneCall className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>Immediate danger? Call Campus Security Dispatch: <strong>0800-CAMPUS-SAFE</strong> or <strong>112</strong></span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold h-13 rounded-2xl transition-all text-sm"
                >
                  Skip for Now
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || (isSafetyReport && !safetyDetails.trim())}
                  className={`flex-[2] font-bold h-13 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl transition-all ${
                    isSafetyReport
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isSafetyReport ? 'Submit Safety Report & Review' : 'Submit Review'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
