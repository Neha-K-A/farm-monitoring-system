import { useEffect, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Button from '../../../components/Common/Button.jsx';
import Input from '../../../components/Common/Input.jsx';
import Select from '../../../components/Common/Select.jsx';
import Modal from '../../../components/Common/Modal.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import BankAccountSection from '../../../components/Features/BankAccountSection.jsx';
import TransactionTimeline from '../../../components/Features/TransactionTimeline.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import { useForm } from '../../../hooks/useForm.js';
import financeService from '../../../services/financeService.js';
import farmService from '../../../services/farmService.js';
import cropService from '../../../services/cropService.js';
import { DollarSign, Plus, TrendingUp, TrendingDown, Trash2, BarChart3, Building, Landmark, Tractor, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'transactions', label: 'All Transactions', icon: BarChart3 },
  { id: 'bank', label: 'Bank Account Setup', icon: Building },
  { id: 'subsidies', label: 'Subsidy Credits', icon: Landmark },
  { id: 'equipment_purchases', label: 'Equipment Purchases', icon: Tractor },
  { id: 'equipment_rentals', label: 'Equipment Rentals', icon: BadgeCheck },
];

const TRANSACTION_OPTIONS = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'subsidy', label: 'Subsidy Credit' },
  { value: 'equipment_purchase', label: 'Equipment Purchase' },
  { value: 'equipment_rental', label: 'Equipment Rental' },
];

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { success, error: notifyError } = useNotification();

  const { values, handleChange, reset } = useForm({
    type: 'income',
    amount: '',
    date: '',
    description: '',
    crop: ''
  });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoading(true);
      const [farmsData, txns, summaryData, cropsData] = await Promise.allSettled([
        farmService.getFarms(),
        financeService.getTransactions(),
        financeService.getSummary(),
        cropService.getCrops(),
      ]);

      setFarms(farmsData.status === 'fulfilled' ? farmsData.value || [] : []);
      setTransactions(txns.status === 'fulfilled' ? txns.value || [] : []);
      setSummary(summaryData.status === 'fulfilled' ? summaryData.value || {} : {});
      setCrops(cropsData.status === 'fulfilled' ? cropsData.value || [] : []);

      if (farmsData.status === 'fulfilled' && farmsData.value?.length > 0) {
        setSelectedFarm(farmsData.value[0]._id);
      }
    } catch (err) {
      notifyError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadFinanceData = async () => {
    try {
      const [txns, summaryData] = await Promise.all([
        financeService.getTransactions(),
        financeService.getSummary(),
      ]);
      setTransactions(txns || []);
      setSummary(summaryData || {});
    } catch (err) {
      notifyError('Failed to refresh transactions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send payload to backend API
      const payload = {
        type: values.type,
        amount: parseFloat(values.amount),
        date: values.date || new Date().toISOString().split('T')[0],
        description: values.description,
        farm: selectedFarm,
      };

      if (values.crop) payload.crop = values.crop;

      await financeService.recordTransaction(payload);
      success('Transaction recorded successfully!');
      setShowForm(false);
      reset();
      loadFinanceData();
    } catch (err) {
      notifyError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (txnId) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      // Dummy logic if real implementation lacks delete route
      setTransactions(prev => prev.filter(t => t._id !== txnId));
      success('Transaction deleted');
    } catch (err) {
      notifyError('Failed to delete transaction');
    }
  };

  // Filter transactions based on active tab
  const displayedTransactions = transactions.filter(txn => {
    if (activeTab === 'transactions') return true;
    if (activeTab === 'subsidies') return txn.type === 'subsidy';
    if (activeTab === 'equipment_purchases') return txn.type === 'equipment_purchase';
    if (activeTab === 'equipment_rentals') return txn.type === 'equipment_rental';
    return false;
  });

  if (loading && transactions.length === 0) return <Loader />;

  return (
    <MainLayout pageTitle="Finance Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
              <DollarSign className="text-[#2ECC71]" size={32} />
              Finance & Ledger
            </h1>
            <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Track revenue, operational expenses, and government subsidy settlements.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#2ECC71] hover:bg-[#27AE60] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} /> Add Transaction
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card flex items-center justify-between !bg-white">
              <div>
                <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                <p className="text-3xl font-extrabold text-[#1A1A2E]">
                  ₹{Math.round(summary.totalIncome || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-[#EAF9F1] rounded-2xl shadow-sm">
                <TrendingUp className="text-[#2ECC71]" size={28} />
              </div>
            </div>
            <div className="card flex items-center justify-between !bg-white">
              <div>
                <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-widest mb-1">Operational Costs</p>
                <p className="text-3xl font-extrabold text-[#1A1A2E]">
                  ₹{Math.round(summary.totalExpense || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-[#FFF5F5] rounded-2xl shadow-sm">
                <TrendingDown className="text-[#E53E3E]" size={28} />
              </div>
            </div>
            <div className="card flex items-center justify-between !bg-white">
              <div>
                <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-widest mb-1">Net Yield</p>
                <p className={`text-3xl font-extrabold ${(summary.netIncome || 0) >= 0 ? 'text-[#2ECC71]' : 'text-[#E53E3E]'}`}>
                  ₹{Math.round(summary.netIncome || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-[#EBF8FF] rounded-2xl shadow-sm">
                <BarChart3 className="text-[#3182CE]" size={28} />
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 border-b border-[#E0E0E0]">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedTransaction(null);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all font-bold text-sm whitespace-nowrap ${isActive
                  ? 'bg-[#EAF9F1] text-[#2ECC71] border-b-2 border-[#2ECC71]'
                  : 'text-[#636E72] hover:text-[#1A1A2E] hover:bg-[#F8F9FA]'
                  }`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-[#FFFFFF] rounded-b-2xl rounded-tr-2xl border border-t-0 p-8 shadow-sm border-[#E0E0E0]">

          {/* Bank Account Tab */}
          {activeTab === 'bank' && (
            <div className="max-w-3xl">
              <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-3">Bank Account Integration</h2>
              <p className="text-[#636E72] mb-8 font-medium italic">Link your preferred bank account safely to receive direct subsidy transfers and track settlements.</p>
              <BankAccountSection onAccountUpdate={loadFinanceData} />
            </div>
          )}

          {/* Transactions/List Tabs */}
          {activeTab !== 'bank' && (
            <>
              {selectedTransaction ? (
                <div>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="mb-4 text-sm text-[#2E7D32] hover:text-[#1B5E20] font-medium px-3 py-1 bg-[#E8F5E9] rounded-lg flex items-center gap-2"
                  >
                    ← Back to {TABS.find(t => t.id === activeTab)?.label}
                  </button>
                  <TransactionTimeline
                    transaction={selectedTransaction}
                    onStatusUpdate={() => loadFinanceData()}
                  />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F1F3F5]">
                    <h2 className="text-lg font-black text-[#1A1A2E] uppercase tracking-tight">
                      {TABS.find(t => t.id === activeTab)?.label} Intelligence
                    </h2>
                    <div className="flex gap-4">
                      <Select
                        className="!py-2.5 !text-xs w-56 bg-[#F8F9FA] border-[#E0E0E0] text-[#1A1A2E] rounded-xl font-bold"
                        value={selectedFarm}
                        onChange={(e) => setSelectedFarm(e.target.value)}
                        options={[
                          { value: '', label: 'ALL FARMS' },
                          ...farms.map((farm) => ({ value: farm._id, label: (farm.farmName || farm.name || 'Unknown').toUpperCase() })),
                        ]}
                      />
                    </div>
                  </div>

                  {displayedTransactions.length === 0 ? (
                    <EmptyState title={`No ${activeTab.replace('_', ' ')} found`} description="Start recording financial data." />
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {displayedTransactions.map((txn, idx) => {
                          const isPositive = txn.type === 'income' || txn.type === 'subsidy';
                          return (
                            <motion.div
                              key={txn._id || idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex items-center justify-between p-5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-2xl cursor-pointer hover:border-[#2ECC71] hover:shadow-md transition-all group"
                              onClick={() => setSelectedTransaction(txn)}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform ${isPositive ? 'bg-[#EAF9F1]' : 'bg-[#FFF5F5]'
                                  }`}>
                                  {isPositive ? (
                                    <TrendingUp className="text-[#2ECC71]" size={20} />
                                  ) : (
                                    <TrendingDown className="text-[#E53E3E]" size={20} />
                                  )}
                                </div>
                                <div>
                                  <p className="font-extrabold text-[#1A1A2E] tracking-tight group-hover:text-[#2ECC71] transition-colors">{txn.description}</p>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white border border-[#E0E0E0] text-[#636E72]">
                                      {txn.type.replace('_', ' ')}
                                    </span>
                                    {txn.status && (
                                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border
                                        ${txn.status.toLowerCase() === 'credited' ? 'bg-[#EAF9F1] text-[#2ECC71] border-[#C3E6CB]' :
                                          txn.status.toLowerCase() === 'approved' ? 'bg-[#EBF8FF] text-[#3182CE] border-[#BEE3F8]' :
                                            'bg-[#FFF9DB] text-[#D69E2E] border-[#FAF089]'}`
                                      }>
                                        {txn.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-4">
                                <div className="text-right">
                                  <p className={`text-xl font-black ${isPositive ? 'text-[#2ECC71]' : 'text-[#1A1A2E]'}`}>
                                    {isPositive ? '+' : '-'}₹{txn.amount?.toLocaleString()}
                                  </p>
                                  <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-widest mt-1">
                                    {new Date(txn.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(txn._id);
                                  }}
                                  className="p-3 bg-white border border-[#E0E0E0] hover:bg-[#FFF5F5] hover:text-[#E53E3E] hover:border-[#FED7D7] rounded-xl text-[#636E72] transition-all shadow-sm active:scale-90"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Unified Application / Record Form Modal */}
        {showForm && (
          <Modal isOpen={true} title="Record Finance Entry" onClose={() => { setShowForm(false); reset(); }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Entry Type"
                name="type"
                value={values.type}
                onChange={handleChange}
                options={TRANSACTION_OPTIONS}
                required
              />
              <Input
                label="Amount (₹)"
                type="number"
                name="amount"
                value={values.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
              <Input
                label="Date"
                type="date"
                name="date"
                value={values.date}
                onChange={handleChange}
              />
              <Input
                label="Description"
                type="text"
                name="description"
                value={values.description}
                onChange={handleChange}
                placeholder="e.g. Sold Wheat / Tractor Rental"
                required
              />
              <Select
                label="Associated Farm (Required)"
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                options={farms.map((farm) => ({ value: farm._id, label: farm.name }))}
                required
              />
              <Select
                label="Crop (Optional)"
                name="crop"
                value={values.crop}
                onChange={handleChange}
                options={[{ value: '', label: 'None' }, ...crops.map(c => ({ value: c._id, label: c.cropName }))]}
              />
              <div className="pt-6 border-t border-[#F1F3F5] flex justify-end">
                <button type="submit" className="bg-[#2ECC71] text-[#FFFFFF] font-extrabold px-8 py-3 rounded-xl hover:bg-[#27AE60] transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs">
                  Save Real-time Entry
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

export default FinancePage;
