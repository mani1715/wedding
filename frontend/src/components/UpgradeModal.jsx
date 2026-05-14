import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Lock, Zap, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * PHASE 34: Upgrade Modal Component with Razorpay Integration
 * Real payment processing with Razorpay (replaces PHASE 33 mock system)
 */
const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  currentPlan = 'FREE',
  profileId,
  onUpgradeSuccess 
}) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failed' | null
  const [errorMessage, setErrorMessage] = useState('');

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const plans = {
    FREE: {
      name: 'Free',
      price: 0,
      icon: '🆓',
      color: 'gray',
      features: [
        'Basic invitation',
        'RSVP management',
        'Guest wishes',
        'Limited designs',
        'Watermark included'
      ],
      limitations: [
        'No video support',
        'No analytics',
        'No background music',
        'No gallery'
      ]
    },
    SILVER: {
      name: 'Silver',
      price: 999,
      icon: '🥈',
      color: 'blue',
      popular: false,
      features: [
        'Everything in Free',
        'Background music',
        'Limited gallery (10 images)',
        'Basic analytics',
        'Custom colors',
        'No watermark'
      ],
      limitations: [
        'No video support',
        'Limited analytics',
        'No AI features'
      ]
    },
    GOLD: {
      name: 'Gold',
      price: 1999,
      icon: '🥇',
      color: 'yellow',
      popular: true,
      features: [
        'Everything in Silver',
        'Hero video',
        'Event-wise gallery (50 images)',
        'Advanced analytics',
        'Passcode protection',
        'Premium designs'
      ],
      limitations: [
        'No AI features',
        'Limited gallery'
      ]
    },
    PLATINUM: {
      name: 'Platinum',
      price: 3999,
      icon: '💎',
      color: 'purple',
      popular: false,
      features: [
        'Everything in Gold',
        '✨ All features unlocked',
        'AI translation',
        'AI descriptions',
        'Unlimited gallery',
        'Premium support'
      ],
      limitations: []
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan || selectedPlan === currentPlan || selectedPlan === 'FREE') return;

    setLoading(true);
    setPaymentStatus(null);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('admin_token');
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

      // Step 1: Create payment order
      const orderResponse = await fetch(`${backendUrl}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile_id: profileId,
          plan_type: selectedPlan
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.detail || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      
      // Step 2: Open Razorpay Checkout
      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Wedding Invite Premium',
        description: `Upgrade to ${plans[selectedPlan].name} Plan`,
        order_id: orderData.order_id,
        handler: async (response) => {
          // Step 3: Verify payment on backend
          await verifyPayment(orderData.payment_id, response);
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: selectedPlan === 'SILVER' ? '#3B82F6' : 
                 selectedPlan === 'GOLD' ? '#EAB308' : 
                 '#9333EA'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setErrorMessage('Payment cancelled by user');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentId, razorpayResponse) => {
    try {
      const token = localStorage.getItem('admin_token');
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

      const verifyResponse = await fetch(`${backendUrl}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_id: paymentId,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verifyData = await verifyResponse.json();
      
      if (verifyData.success && verifyData.plan_activated) {
        setPaymentStatus('success');
        
        // Call success callback
        if (onUpgradeSuccess) {
          onUpgradeSuccess({
            plan_type: selectedPlan,
            plan_expires_at: verifyData.plan_expires_at
          });
        }

        // Auto close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error('Plan activation failed');
      }

    } catch (error) {
      console.error('Verification error:', error);
      setPaymentStatus('failed');
      setErrorMessage(error.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminOverride = async () => {
    // Admin can still manually assign plans (PHASE 33 functionality preserved)
    if (!selectedPlan || selectedPlan === currentPlan) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const response = await fetch(`${backendUrl}/admin/profiles/${profileId}/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_type: selectedPlan,
          plan_expires_at: selectedPlan === 'FREE' ? null : expiryDate.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      const data = await response.json();
      
      if (onUpgradeSuccess) {
        onUpgradeSuccess(data);
      }

      setPaymentStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Admin override error:', error);
      setErrorMessage('Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Success State
  if (paymentStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">
            Your {plans[selectedPlan]?.name} plan has been activated successfully.
          </p>
          <p className="text-sm text-gray-500">
            Closing automatically...
          </p>
        </div>
      </div>
    );
  }

  // Failed State
  if (paymentStatus === 'failed') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h3>
          <p className="text-gray-600 mb-6">
            {errorMessage || 'Something went wrong. Please try again.'}
          </p>
          <button
            onClick={() => {
              setPaymentStatus(null);
              setErrorMessage('');
            }}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-sm text-gray-600 mt-1">
              Current plan: <span className="font-semibold">{plans[currentPlan].name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(plans).map(([key, plan]) => {
              const isCurrentPlan = key === currentPlan;
              const isSelected = key === selectedPlan;
              const canSelect = key !== currentPlan;

              const colorClasses = {
                gray: 'border-gray-300 hover:border-gray-400',
                blue: 'border-blue-300 hover:border-blue-500',
                yellow: 'border-yellow-300 hover:border-yellow-500',
                purple: 'border-purple-300 hover:border-purple-500'
              };

              const selectedClasses = {
                gray: 'border-gray-500 ring-2 ring-gray-500',
                blue: 'border-blue-500 ring-2 ring-blue-500',
                yellow: 'border-yellow-500 ring-2 ring-yellow-500',
                purple: 'border-purple-500 ring-2 ring-purple-500'
              };

              return (
                <div
                  key={key}
                  className={`
                    relative border-2 rounded-xl p-5 transition-all cursor-pointer
                    ${isSelected ? selectedClasses[plan.color] : colorClasses[plan.color]}
                    ${isCurrentPlan ? 'opacity-60' : 'hover:shadow-lg'}
                  `}
                  onClick={() => canSelect && setSelectedPlan(key)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        POPULAR
                      </span>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                        CURRENT
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{plan.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                      {plan.price > 0 && <span className="text-sm text-gray-600">/30 days</span>}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Features
                    </div>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="pt-3 border-t">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Limitations
                      </div>
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-start gap-2 mb-2">
                          <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment Notice */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Secure Payment with Razorpay</p>
                <p className="text-xs text-gray-600 mt-1">
                  Your payment is processed securely through Razorpay. We accept all major payment methods.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              {/* Admin Override Button (hidden for regular users) */}
              <button
                onClick={handleAdminOverride}
                disabled={!selectedPlan || selectedPlan === currentPlan || loading}
                className="px-4 py-2.5 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                title="Admin: Assign plan without payment"
              >
                Admin Override
              </button>
              
              {/* Main Payment Button */}
              <button
                onClick={handleUpgrade}
                disabled={!selectedPlan || selectedPlan === currentPlan || selectedPlan === 'FREE' || loading}
                className={`
                  px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
                  ${selectedPlan && selectedPlan !== currentPlan && selectedPlan !== 'FREE' && !loading
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {selectedPlan && selectedPlan !== 'FREE' ? `Pay ₹${plans[selectedPlan].price}` : 'Select a Plan'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
