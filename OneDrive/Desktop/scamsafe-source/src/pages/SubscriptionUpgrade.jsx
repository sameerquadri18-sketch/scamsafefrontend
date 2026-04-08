import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Crown, Check, X, ArrowLeft, Sparkles, Star, ArrowUp, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { upgradeSubscription, getSubscriptionPlans } from '../utils/api';
import { useApp } from '../contexts/AppContext';

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

export default function SubscriptionUpgrade() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  useEffect(() => {
    if (user?.plan) {
      // Handle different plan name formats from backend
      const normalizedPlan = user.plan === 'shield_pro' ? 'shield-pro' : 
                            user.plan === 'family_vault' ? 'family-vault' : 
                            user.plan || 'free';
      setCurrentPlan(normalizedPlan);
    }
  }, [user]);

  const handleUpgrade = async (planKey) => {
    setUpgrading(true);
    setSelectedPlan(planKey);
    setUpgradeError('');
    
    try {
      const result = await upgradeSubscription(user?.phone, planKey);
      if (result.success) {
        setUpgradeSuccess(true);
        setCurrentPlan(planKey);
        // Update user context if needed
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      setUpgradeError('Upgrade failed. Please try again.');
    } finally {
      setUpgrading(false);
      setSelectedPlan(null);
    }
  };

  const getAvailablePlans = () => {
    // Only show plans that are higher than current plan
    const planHierarchy = ['free', 'shield-pro', 'family-vault'];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    return Object.entries(plans).filter(([key]) => {
      const planIndex = planHierarchy.indexOf(key);
      return planIndex > currentIndex;
    });
  };

  const availablePlans = getAvailablePlans();

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SS</span>
                </div>
                <span className="text-white font-bold">ScamSafe</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Upgrade Your Protection
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass-card p-6 border-2 border-purple-600/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Upgrade Your Subscription</h1>
                <p className="text-gray-400">
                  You're currently on the <span className="text-purple-400 font-semibold">{plans[currentPlan]?.name}</span> plan.
                  {currentPlan !== 'family-vault' && ' Choose a better plan below for enhanced protection.'}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-2xl ${plans[currentPlan]?.bgColor} flex items-center justify-center`}>
                {React.createElement(plans[currentPlan]?.icon, { 
                  size: 32, 
                  className: plans[currentPlan]?.borderColor.replace('border', 'text') 
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {upgradeSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="glass-card p-4 border-2 border-green-600/30 bg-green-600/10">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-green-400" />
                  <div>
                    <p className="text-green-400 font-semibold">Upgrade Successful!</p>
                    <p className="text-gray-300 text-sm">Redirecting to dashboard...</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {upgradeError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="glass-card p-4 border-2 border-red-600/30 bg-red-600/10">
              <div className="flex items-center gap-3">
                <X size={20} className="text-red-400" />
                <p className="text-red-400">{upgradeError}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Available Plans */}
        {availablePlans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {availablePlans.map(([key, plan]) => {
              const PlanIcon = plan.icon;
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`relative glass-card p-6 rounded-2xl border-2 ${
                    plan.borderColor
                  } ${plan.popular ? 'ring-2 ring-purple-600/50' : ''}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      MOST POPULAR
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

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpgrade(key)}
                    disabled={upgrading && selectedPlan === key}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {upgrading && selectedPlan === key ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Upgrade Now
                        <ArrowUp size={18} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mx-auto mb-4">
              <Crown size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">You're on our best plan!</h3>
            <p className="text-gray-400 mb-6">You're already enjoying all the features ScamSafe has to offer.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium py-2.5 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}

        {/* Comparison Table */}
        {availablePlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6">Plan Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm glass-card border border-gray-800">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-6 text-gray-400 font-semibold">Feature</th>
                    <th className="text-center py-4 px-6 text-gray-400 font-semibold">Free</th>
                    <th className="text-center py-4 px-6 text-gray-400 font-semibold">Shield Pro</th>
                    <th className="text-center py-4 px-6 text-gray-400 font-semibold">Family Vault</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-4 px-6 text-gray-300 font-medium">Scans</td>
                    <td className="text-center py-4 px-6 text-gray-400">1/month</td>
                    <td className="text-center py-4 px-6 text-green-400 font-semibold">Unlimited</td>
                    <td className="text-center py-4 px-6 text-green-400 font-semibold">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-4 px-6 text-gray-300 font-medium">Family Members</td>
                    <td className="text-center py-4 px-6 text-gray-400">1</td>
                    <td className="text-center py-4 px-6 text-gray-400">1</td>
                    <td className="text-center py-4 px-6 text-green-400 font-semibold">5</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-4 px-6 text-gray-300 font-medium">WhatsApp Updates</td>
                    <td className="text-center py-4 px-6">
                      <X size={16} className="inline text-red-400" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check size={16} className="inline text-green-400" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check size={16} className="inline text-green-400" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-4 px-6 text-gray-300 font-medium">Priority Support</td>
                    <td className="text-center py-4 px-6">
                      <X size={16} className="inline text-red-400" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check size={16} className="inline text-green-400" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check size={16} className="inline text-green-400" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-300 font-medium">Price</td>
                    <td className="text-center py-4 px-6 text-gray-400">Free</td>
                    <td className="text-center py-4 px-6 text-purple-400 font-semibold">Rs. 399/month</td>
                    <td className="text-center py-4 px-6 text-amber-400 font-semibold">Rs. 6,990/month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
