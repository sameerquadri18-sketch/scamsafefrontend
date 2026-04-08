import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Crown, ArrowUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = {
  free: {
    name: 'Free',
    price: 0,
    icon: Shield,
    color: 'from-gray-600 to-gray-700',
    borderColor: 'border-gray-600',
    bgColor: 'bg-gray-600/10'
  },
  'shield-pro': {
    name: 'Shield Pro',
    price: 399,
    icon: Shield,
    color: 'from-purple-600 to-purple-700',
    borderColor: 'border-purple-600',
    bgColor: 'bg-purple-600/10'
  },
  'family-vault': {
    name: 'Family Vault',
    price: 6990,
    icon: Crown,
    color: 'from-amber-600 to-amber-700',
    borderColor: 'border-amber-600',
    bgColor: 'bg-amber-600/10'
  }
};

export default function SubscriptionManager({ currentPlan, onUpgrade }) {
  const navigate = useNavigate();
  
  // Handle different plan name formats from backend
  const normalizedPlan = currentPlan === 'shield_pro' ? 'shield-pro' : 
                          currentPlan === 'family_vault' ? 'family-vault' : 
                          currentPlan || 'free';
  
  const currentPlanInfo = plans[normalizedPlan] || plans.free;
  const CurrentIcon = currentPlanInfo.icon;

  const handleUpgradeClick = () => {
    navigate('/subscription-upgrade');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 border-2 ${currentPlanInfo.borderColor} relative overflow-hidden`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentPlanInfo.color} opacity-5`} />

      <div className="relative z-10">
        {/* Header with Logo and Plan */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* ScamSafe Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-sm">ScamSafe</span>
            </div>
            
            {/* Current Plan */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${currentPlanInfo.bgColor} flex items-center justify-center`}>
                <CurrentIcon size={16} className={currentPlanInfo.borderColor.replace('border', 'text')} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{currentPlanInfo.name}</p>
                <p className="text-gray-400 text-xs">
                  {currentPlanInfo.price === 0 ? 'Free' : `Rs. ${currentPlanInfo.price}/month`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        {currentPlan !== 'family-vault' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpgradeClick}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium py-2.5 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles size={14} />
            Upgrade Plan
            <ArrowUp size={14} />
          </motion.button>
        )}

        {/* Max Plan Indicator */}
        {currentPlan === 'family-vault' && (
          <div className="text-center py-2">
            <span className="text-xs text-green-400 font-medium">You're on our best plan!</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
