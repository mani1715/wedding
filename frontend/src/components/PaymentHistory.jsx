import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, Calendar, Receipt } from 'lucide-react';

/**
 * PHASE 34: Payment History Component
 * Displays payment transaction history for a profile
 */
const PaymentHistory = ({ profileId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentHistory();
  }, [profileId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

      const response = await fetch(`${backendUrl}/payments/history/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Payment history error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'created':
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'created':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'SILVER':
        return 'bg-blue-100 text-blue-700';
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-700';
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading payment history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No payment history found</p>
          <p className="text-sm text-gray-500 mt-1">
            Payment transactions will appear here once you upgrade your plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-purple-600" />
          Payment History
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {payments.length} transaction{payments.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y">
        {payments.map((payment) => (
          <div key={payment.payment_id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Status Icon */}
                <div className="mt-1">
                  {getStatusIcon(payment.payment_status)}
                </div>

                {/* Payment Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(payment.plan_type)}`}>
                      {payment.plan_type}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.payment_status)}`}>
                      {payment.payment_status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(payment.created_at)}</span>
                    </div>
                    
                    {payment.razorpay_payment_id && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-xs">
                          {payment.razorpay_payment_id}
                        </span>
                      </div>
                    )}

                    {payment.payment_method && payment.payment_status === 'success' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          via {payment.payment_method.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {payment.error_message && payment.payment_status === 'failed' && (
                      <div className="text-xs text-red-600 mt-1">
                        {payment.error_message}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {payment.display_amount}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {payment.currency}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
