import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { submitReview } from '../utils/api';

export default function Review() {
  const { customerId, token } = useParams();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    setError('');
    try {
      await submitReview(customerId, token, rating, feedback);
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <CheckCircle2 size={56} className="text-accent-green" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-white">
          Thank you for your feedback!
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-gray-400 max-w-xs">
          Your review helps us protect more Indians from data brokers.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={24} className={rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-14 h-14 rounded-full bg-accent-orange/20 flex items-center justify-center mx-auto mb-4">
          <Shield size={28} className="text-accent-orange" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">How is ScamSafe protecting you?</h1>
        <p className="text-sm text-gray-400">Your honest feedback helps us improve.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        {/* Star Rating */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Tap to rate</p>
          <div className="flex gap-3 justify-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={36}
                  className={`transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Feedback */}
        <div className="mb-4">
          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2 block">
            Tell us about your experience (optional)
          </label>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="What do you like? What could be better?"
            rows={4}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-orange/50 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 text-center mb-3">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            rating > 0
              ? 'glow-button-orange'
              : 'bg-dark-border text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </motion.div>
    </div>
  );
}
