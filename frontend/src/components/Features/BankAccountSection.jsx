import { useState } from 'react';
import Card from '../Common/Card.jsx';
import Button from '../Common/Button.jsx';
import Input from '../Common/Input.jsx';
import Modal from '../Common/Modal.jsx';
import { useNotification } from '../../hooks/useNotification.js';
import financeService from '../../services/financeService.js';
import { CreditCard, Edit2, Check, Copy } from 'lucide-react';

const BankAccountSection = ({ onAccountUpdate }) => {
  const [bankAccount, setBankAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(null);
  const { success, error: notifyError } = useNotification();

  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    accountType: 'savings',
  });

  // Load bank account on mount
  const loadBankAccount = async () => {
    try {
      setLoading(true);
      const account = await financeService.getBankAccount();
      if (account) {
        setBankAccount(account);
        setFormData({
          bankName: account.bankName || '',
          accountNumber: account.accountNumber || '',
          ifscCode: account.ifscCode || '',
          accountHolderName: account.accountHolderName || '',
          accountType: account.accountType || 'savings',
        });
      }
    } catch (err) {
      console.error('Failed to load bank account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await financeService.saveBankAccount(formData);
      setBankAccount(result);
      setShowForm(false);
      success('Bank account saved successfully!');
      if (onAccountUpdate) onAccountUpdate(result);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to save bank account');
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="text-blue-600" size={24} />
          Bank Account Details
        </h3>
        <Button
          onClick={() => {
            if (!bankAccount) {
              setShowForm(true);
            }
          }}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {bankAccount ? (
            <>
              <Edit2 size={16} /> Edit Account
            </>
          ) : (
            <>+ Add Bank Account</>
          )}
        </Button>
      </div>

      {loading && <p className="text-muted">Loading bank account...</p>}

      {bankAccount ? (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Bank Name</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{bankAccount.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Account Holder</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{bankAccount.accountHolderName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Account Number</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-semibold text-gray-900">
                    ••••••{bankAccount.accountNumber?.slice(-4)}
                  </p>
                  <button
                    onClick={() => copyToClipboard(bankAccount.accountNumber, 'account')}
                    className="text-muted hover:text-gray-700"
                  >
                    {copied === 'account' ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">IFSC Code</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-semibold text-gray-900">{bankAccount.ifscCode}</p>
                  <button
                    onClick={() => copyToClipboard(bankAccount.ifscCode, 'ifsc')}
                    className="text-muted hover:text-gray-700"
                  >
                    {copied === 'ifsc' ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-6 border-t border-blue-200">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${bankAccount.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span className="text-sm font-medium text-gray-600">
                {bankAccount.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              size="sm"
              variant="outline"
              className="text-blue-600"
            >
              <Edit2 size={16} /> Edit
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-dashed border-gray-300">
          <CreditCard className="mx-auto text-muted mb-3" size={32} />
          <p className="text-gray-600 font-medium mb-4">No bank account added yet</p>
          <p className="text-muted text-sm mb-6">Add your bank account to receive subsidies and scheme benefits directly</p>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            + Add Bank Account
          </Button>
        </Card>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal
          title={bankAccount ? 'Edit Bank Account' : 'Add Bank Account'}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="State Bank of India"
              required
            />
            <Input
              label="Account Holder Name"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
            <Input
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="1234567890123"
              required
            />
            <Input
              label="IFSC Code"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="SBIN0001234"
              required
            />
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="savings">Savings</option>
                <option value="current">Current</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Bank Account
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BankAccountSection;
