import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Crown, Users, Check, X, ChevronRight, Sparkles, Star, ArrowUp, CreditCard, Loader2 } from 'lucide-react';
import { upgradeSubscription, getSubscriptionPlans } from '../utils/api';

const plans = {
  free: {
    name: 'Free',
    price: 0,
    features: ['1 scan every 30 days', 'Basic breach detection', 'Email notifications'],
    icon: Shield,
    color: 'from-gray-600 to-gray-700',
    borderColor: 'border-gray-600',
    bgColor: 'bg-gray-600/10',
    popular: false
  },
  'shield-pro': {
    name: 'Shield Pro',
    price: 399,
    features: ['Unlimited scans', 'Advanced breach detection', 'Priority removal', 'WhatsApp updates', '24/7 support'],
    icon: Shield,
    color: 'from-purple-600 to-purple-700',
    borderColor: 'border-purple-600',
    bgColor: 'bg-purple-600/10',
    popular: true
  },
  'family-vault': {
    name: 'Family Vault',
    price: 6990,
    features: ['Everything in Shield Pro', 'Protect up to 5 family members', 'Family dashboard', 'Shared removal service'],
    icon: Crown,
    color: 'from-amber-600 to-amber-700',
    borderColor: 'border-amber-600',
    bgColor: 'bg-amber-600/10',
    popular: false
  }
};

export default function SubscriptionManager({ currentPlan, onUpgrade }) {
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const currentPlanInfo = plans[currentPlan] || plans.free;
  const CurrentIcon = currentPlanInfo.icon;

  const handleUpgrade = async (planKey) => {
    setUpgrading(true);
    setSelectedPlan(planKey);
    
    try {
      const result = await upgradeSubscription(planKey);
      if (result.success) {
        onUpgrade && onUpgrade(planKey);
        setShowAllPlans(false);
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setUpgrading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-6 border-2 ${currentPlanInfo.borderColor} relative overflow-hidden`}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentPlanInfo.color} opacity-5`} />
        
        {/* Popular Badge */}
        {currentPlanInfo.popular && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-3 py-1 rounded-full font-semibold">
            POPULAR
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${currentPlanInfo.bgColor} flex items-center justify-center`}>
                <CurrentIcon size={32} className={currentPlanInfo.borderColor.replace('border', 'text')} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{currentPlanInfo.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">
                    {currentPlanInfo.price === 0 ? 'Free' : `Rs. ${currentPlanInfo.price}`}
                  </span>
                  {currentPlanInfo.price > 0 && (
                    <span className="text-sm text-gray-400">/month</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan Features */}
          <div className="space-y-2 mb-6">
            {currentPlanInfo.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* Upgrade Button */}
          {currentPlan !== 'family-vault' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAllPlans(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2"
            >
              <ArrowUp size={18} />
              Upgrade Plan
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* All Plans Modal */}
      {showAllPlans && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAllPlans(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0d1b2a] border border-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
              <button
                onClick={() => setShowAllPlans(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(plans).map(([key, plan]) => {
                const PlanIcon = plan.icon;
                const isCurrentPlan = key === currentPlan;
                const isUpgrade = key !== 'free' && (key === 'family-vault' || (key === 'shield-pro' && currentPlan === 'free'));

                return (
                  <motion.div
                    key={key}
                    whileHover={{ y: -5 }}
                    className={`relative glass-card p-6 rounded-2xl border-2 ${
                      isCurrentPlan ? plan.borderColor : 'border-gray-800'
                    } ${plan.popular && !isCurrentPlan ? 'ring-2 ring-purple-600/50' : ''}`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        MOST POPULAR
                      </div>
                    )}

                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        CURRENT PLAN
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 rounded-2xl ${plan.bgColor} flex items-center justify-center mx-auto mb-4`}>
                        <PlanIcon size={32} className={plan.borderColor.replace('border', 'text')} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold text-white">
                          {plan.price === 0 ? 'Free' : `Rs. ${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-sm text-gray-400">/month</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check size={16} className="text-green-400 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {!isCurrentPlan && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUpgrade(key)}
                        disabled={upgrading && selectedPlan === key}
                        className={`w-full font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                          isUpgrade
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        } disabled:opacity-50`}
                      >
                        {upgrading && selectedPlan === key ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                          </>
                        ) : isUpgrade ? (
                          <>
                            <ArrowUp size={18} />
                            Upgrade Now
                          </>
                        ) : (
                          'Downgrade'
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Comparison Table */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Plan Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400">Feature</th>
                      <th className="text-center py-3 px-4 text-gray-400">Free</th>
                      <th className="text-center py-3 px-4 text-gray-400">Shield Pro</th>
                      <th className="text-center py-3 px-4 text-gray-400">Family Vault</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-3 px-4 text-gray-300">Scans</td>
                      <td className="text-center py-3 px-4 text-gray-400">1/month</td>
                      <td className="text-center py-3 px-4 text-green-400">Unlimited</td>
                      <td className="text-center py-3 px-4 text-green-400">Unlimited</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-3 px-4 text-gray-300">Family Members</td>
                      <td className="text-center py-3 px-4 text-gray-400">1</td>
                      <td className="text-center py-3 px-4 text-gray-400">1</td>
                      <td className="text-center py-3 px-4 text-green-400">5</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-3 px-4 text-gray-300">WhatsApp Updates</td>
                      <td className="text-center py-3 px-4 text-gray-400">
                        <X size={16} className="inline text-red-400" />
                      </td>
                      <td className="text-center py-3 px-4 text-green-400">
                        <Check size={16} className="inline text-green-400" />
                      </td>
                      <td className="text-center py-3 px-4 text-green-400">
                        <Check size={16} className="inline text-green-400" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-3 px-4 text-gray-300">Priority Support</td>
                      <td className="text-center py-3 px-4 text-gray-400">
                        <X size={16} className="inline text-red-400" />
                      </td>
                      <td className="text-center py-3 px-4 text-green-400">
                        <Check size={16} className="inline text-green-400" />
                      </td>
                      <td className="text-center py-3 px-4 text-green-400">
                        <Check size={16} className="inline text-green-400" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
