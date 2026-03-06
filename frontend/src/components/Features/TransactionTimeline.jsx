import { useState } from 'react';
import Card from '../Common/Card.jsx';
import Button from '../Common/Button.jsx';
import Loader from '../Common/Loader.jsx';
import { useNotification } from '../../hooks/useNotification.js';
import financeService from '../../services/financeService.js';
import { Clock, CheckCircle, Zap, ArrowRight } from 'lucide-react';

const TransactionTimeline = ({ transaction, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const { success, error: notifyError } = useNotification();

  const statusSequence = ['initiated', 'processing', 'approved', 'transferred', 'credited'];
  
  const statusConfig = {
    initiated: {
      label: 'Initiated',
      icon: Clock,
      color: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
    },
    processing: {
      label: 'Processing',
      icon: Zap,
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle,
      color: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
    },
    transferred: {
      label: 'Transferred',
      icon: ArrowRight,
      color: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300',
    },
    credited: {
      label: 'Credited',
      icon: CheckCircle,
      color: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-300',
    },
  };

  const getCurrentStatusIndex = () => {
    return statusSequence.indexOf(transaction?.status || 'initiated');
  };

  const handleAutoAdvanceStatus = async () => {
    const currentIdx = getCurrentStatusIndex();
    if (currentIdx < statusSequence.length - 1) {
      const nextStatus = statusSequence[currentIdx + 1];
      try {
        setLoading(true);
        await financeService.updateTransactionStatus(transaction._id, nextStatus);
        success(`Status updated to: ${statusConfig[nextStatus].label}`);
        if (onStatusUpdate) onStatusUpdate();
      } catch (err) {
        notifyError('Failed to update status');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSimulateFullFlow = async () => {
    if (window.confirm('Simulate full transaction flow? This will advance status to CREDITED.')) {
      try {
        setLoading(true);
        await financeService.simulateTransactionFlow(transaction._id);
        success('Transaction flow completed!');
        if (onStatusUpdate) onStatusUpdate();
      } catch (err) {
        notifyError('Failed to simulate flow');
      } finally {
        setLoading(false);
      }
    }
  };

  const getTimelineSteps = () => {
    return statusSequence.map((status, idx) => {
      const currentIdx = getCurrentStatusIndex();
      const isCompleted = idx <= currentIdx;
      const isCurrent = idx === currentIdx;
      const config = statusConfig[status];
      const Icon = config.icon;
      const timestamp = transaction?.timeline?.[status];

      return (
        <div key={status} className="flex items-center">
          {/* Step Circle */}
          <div className={`relative flex items-center justify-center`}>
            <div
              className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isCompleted ? config.color + ' ' + config.borderColor : 'bg-gray-50 border-gray-300'
              } ${isCurrent ? 'ring-4 ring-offset-2' : ''}`}
              style={isCurrent ? { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' } : {}}
            >
              <Icon
                size={24}
                className={isCompleted ? config.textColor : 'text-muted'}
              />
            </div>

            {/* Animated pulse for current status */}
            {isCurrent && (
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                }}
              />
            )}
          </div>

          {/* Step Info */}
          <div className="ml-4 flex-1">
            <p className={`font-semibold ${isCompleted ? config.textColor : 'text-muted'}`}>
              {config.label}
            </p>
            {timestamp && (
              <p className="text-xs text-muted mt-1">
                {new Date(timestamp).toLocaleString()}
              </p>
            )}
            {!timestamp && isCompleted && (
              <p className="text-xs text-muted mt-1">Completed</p>
            )}
            {!isCompleted && (
              <p className="text-xs text-muted mt-1">Pending</p>
            )}
          </div>

          {/* Arrow to next step */}
          {idx < statusSequence.length - 1 && (
            <div className="ml-4 mr-4 flex-1">
              <div
                className={`h-1 transition-all duration-300 ${
                  isCompleted ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            </div>
          )}
        </div>
      );
    });
  };

  const currentIdx = getCurrentStatusIndex();
  const isComplete = currentIdx === statusSequence.length - 1;

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transaction Status</h3>
          <p className="text-sm text-gray-600 mt-1">
            Transaction ID: <span className="font-mono text-gray-700">{transaction?._id?.slice(-8)}</span>
          </p>
          {transaction?.description && (
            <p className="text-sm text-gray-600 mt-2">{transaction.description}</p>
          )}
        </div>

        {/* Timeline Steps */}
        <div className="space-y-4">
          {getTimelineSteps()}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-4 border-t border-blue-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Current Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[transaction?.status]?.color} ${statusConfig[transaction?.status]?.textColor}`}>
              {statusConfig[transaction?.status]?.label}
            </span>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className="text-xs text-gray-600">Amount</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              ₹{transaction?.amount?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isComplete && (
            <>
              <Button
                onClick={handleAutoAdvanceStatus}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader size={16} /> : 'Next Status'}
              </Button>
              <Button
                onClick={handleSimulateFullFlow}
                disabled={loading}
                variant="outline"
                className="flex-1 text-blue-600"
              >
                {loading ? <Loader size={16} /> : 'Simulate Complete'}
              </Button>
            </>
          )}
          {isComplete && (
            <div className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
              <p className="text-emerald-700 font-medium text-sm">✓ Completed Successfully</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Demo Mode:</strong> Use the "Next Status" button to advance through the transaction lifecycle. In production, these transitions would be automated based on government/bank APIs.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TransactionTimeline;
