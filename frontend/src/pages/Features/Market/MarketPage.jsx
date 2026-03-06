import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Button from '../../../components/Common/Button.jsx';
import Input from '../../../components/Common/Input.jsx';
import Select from '../../../components/Common/Select.jsx';
import Modal from '../../../components/Common/Modal.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import { useForm } from '../../../hooks/useForm.js';
import marketService from '../../../services/marketService.js';
import financeService from '../../../services/financeService.js';
import farmService from '../../../services/farmService.js';
import { PRODUCT_CATEGORIES } from '../../../utils/constants.js';
import { Store, Plus, Trash2, Tractor, Sprout, ShoppingCart, Clock } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'All Listings', icon: Store },
  { id: 'produce', label: 'Farm Produce', icon: Sprout },
  { id: 'equipment', label: 'Equipment & Tools', icon: Tractor }
];

const MarketPage = () => {
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [editingListing, setEditingListing] = useState(null);
  const { success, error: notifyError } = useNotification();

  const { values, handleChange, reset } = useForm({
    productName: '',
    category: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    moq: '',
    availableFrom: '',
    isOrganic: false,
    transactionType: 'buy',
    rentalPeriod: 'day'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [publicListings, userListings, userFarms] = await Promise.all([
        marketService.getListings(),
        marketService.getMyListings(),
        farmService.getFarms()
      ]);
      setListings(publicListings || []);
      setMyListings(userListings || []);
      setFarms(userFarms || []);
    } catch (err) {
      notifyError('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingListing) {
        await marketService.updateListing(editingListing._id, values);
        success('Listing updated successfully!');
      } else {
        await marketService.createListing(values);
        success('Listing created successfully!');
      }
      setShowForm(false);
      setEditingListing(null);
      reset();
      loadData();
    } catch (err) {
      notifyError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await marketService.deleteListing(listingId);
      success('Listing deleted successfully!');
      loadData();
    } catch (err) {
      notifyError('Failed to delete listing');
    }
  };

  const handleTransaction = async (listing) => {
    if (farms.length === 0) {
      notifyError('You need to register a farm first to make a transaction.');
      return;
    }

    if (!window.confirm(`Confirm ${listing.transactionType === 'rent' ? 'rental' : 'purchase'} of ${listing.productName} for ₹${listing.pricePerUnit}?`)) return;

    try {
      const isEquipment = ['equipment', 'tractor', 'tool'].includes(listing.category);
      let tType = 'expense';
      if (isEquipment) {
        tType = listing.transactionType === 'rent' ? 'equipment_rental' : 'equipment_purchase';
      }

      const payload = {
        type: tType,
        amount: listing.pricePerUnit * (listing.moq || 1),
        date: new Date().toISOString().split('T')[0],
        description: `${listing.transactionType === 'rent' ? 'Rented' : 'Bought'} ${listing.productName}`,
        farm: farms[0]._id, // default to first farm
        status: 'Approved',
      };

      await financeService.recordTransaction(payload);
      success('Transaction recorded in Finance Ledger!');
    } catch (err) {
      notifyError('Transaction failed. Check finance setup.');
    }
  };

  const filteredListings = (showMyListings ? myListings : listings).filter(listing => {
    if (activeTab === 'all') return true;
    const isEquip = ['equipment', 'tractor', 'tool'].includes(listing.category);
    if (activeTab === 'equipment') return isEquip;
    if (activeTab === 'produce') return !isEquip;
    return true;
  });

  if (loading) return <Loader />;

  const isEquipmentForm = ['equipment', 'tractor', 'tool'].includes(values.category);

  return (
    <MainLayout pageTitle="Marketplace">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 card mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
              <Store className="text-[#2ECC71]" size={32} />
              HyperLocal Marketplace
            </h1>
            <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Exchange, trade, and rent premium farm products and heavy machinery.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMyListings(!showMyListings)}
              className="px-5 py-3 rounded-xl border border-[#E0E0E0] bg-white hover:bg-[#F8F9FA] text-[#1A1A2E] font-bold text-sm transition-all shadow-sm active:scale-95"
            >
              {showMyListings ? 'Global Exchange' : 'My Listings'}
            </button>
            <button
              onClick={() => { reset(); setShowForm(true); }}
              className="bg-[#2ECC71] hover:bg-[#27AE60] text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <Plus size={20} /> New Listing
            </button>
          </div>
        </div>

        {/* Tabs */}
        {!showMyListings && (
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 border-b border-[#E0E0E0]">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
        )}

        {/* Listings Grid */}
        <AnimatePresence mode="popLayout">
          {filteredListings.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                title={showMyListings ? "You have no active listings" : `No ${activeTab} available`}
                description="Check back later or create a new listing now."
              />
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing, idx) => {
                const isEquip = ['equipment', 'tractor', 'tool'].includes(listing.category);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    key={listing._id}
                    className="card !p-0 flex flex-col overflow-hidden"
                  >
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-4 rounded-xl shadow-sm ${isEquip ? 'bg-[#FFF9DB] text-[#F39C12]' : 'bg-[#EAF9F1] text-[#2ECC71]'}`}>
                            {isEquip ? <Tractor size={24} /> : <Sprout size={24} />}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-[#1A1A2E] text-lg leading-tight tracking-tight">{listing.productName}</h3>
                            <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-widest mt-0.5">{listing.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          {listing.isOrganic && (
                            <Badge variant="success" className="text-[10px] font-bold px-3 py-1 bg-[#EAF9F1] text-[#2ECC71] border border-[#C3E6CB]">ORGANIC</Badge>
                          )}
                          {!showMyListings && listing.transactionType && (
                            <Badge className="bg-[#EBF8FF] text-[#3182CE] text-[10px] font-bold px-3 py-1 border border-[#BEE3F8] uppercase tracking-tighter">
                              {listing.transactionType === 'rent' ? 'LEASE' : 'SALE'}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl p-5 space-y-4 mb-5 flex-1 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#636E72] uppercase tracking-wider">Trading Price</span>
                          <span className="font-black text-[#1A1A2E] text-lg">
                            ₹{listing.pricePerUnit}
                            <span className="text-xs font-bold text-[#636E72] ml-1">/{listing.transactionType === 'rent' ? (listing.rentalPeriod || 'day') : listing.unit}</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#636E72] uppercase tracking-wider">Stock Available</span>
                          <span className="font-bold text-[#1A1A2E]">{listing.quantity} <span className="text-xs uppercase ml-0.5">{listing.unit}</span></span>
                        </div>
                        {listing.moq > 1 && (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-[#636E72] uppercase tracking-wider">Min. Commitment</span>
                            <span className="font-bold text-[#1A1A2E]">{listing.moq} <span className="text-xs uppercase ml-0.5">{listing.unit}</span></span>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-[#636E72] font-bold uppercase tracking-widest flex items-center gap-2 mb-6 mt-auto">
                        <Clock size={12} className="text-[#2ECC71]" /> Harvesting {new Date(listing.availableFrom).toLocaleDateString()}
                      </p>

                      {showMyListings ? (
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              setEditingListing(listing);
                              Object.keys(values).forEach(key => {
                                if (key in listing) handleChange({ target: { name: key, value: listing[key] } });
                              });
                              setShowForm(true);
                            }}
                            className="flex-1 py-3 rounded-xl bg-[#F8F9FA] hover:bg-[#E0E0E0] text-[#1A1A2E] font-bold text-sm transition-all border border-[#E0E0E0] shadow-sm active:scale-95"
                          >
                            Edit Intelligence
                          </button>
                          <button
                            onClick={() => handleDelete(listing._id)}
                            className="px-4 py-3 rounded-xl bg-[#FFF5F5] hover:bg-[#FED7D7] text-[#C53030] transition-all border border-[#FED7D7] shadow-sm active:scale-95"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleTransaction(listing)}
                          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex flex-row items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${listing.transactionType === 'rent'
                            ? 'bg-[#F8F9FA] hover:bg-[#EAF9F1] text-[#1A1A2E] border border-[#E0E0E0]'
                            : 'bg-[#2ECC71] hover:bg-[#27AE60] text-[#FFFFFF]'
                            }`}
                        >
                          <ShoppingCart size={18} />
                          {listing.transactionType === 'rent' ? 'Lease Machinery' : 'Instant Checkout'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Form Modal */}
        {showForm && (
          <Modal
            title={editingListing ? 'Edit Listing' : 'Create New Listing'}
            onClose={() => {
              setShowForm(false);
              setEditingListing(null);
              reset();
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  type="text"
                  name="productName"
                  value={values.productName}
                  onChange={handleChange}
                  placeholder="e.g. Tomato or Tractor"
                  required
                />
                <Select
                  label="Category"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  options={PRODUCT_CATEGORIES}
                  required
                />
              </div>

              {isEquipmentForm && (
                <div className="grid grid-cols-2 gap-4 bg-surface-1 p-3 rounded-xl border border-border mb-2">
                  <Select
                    label="Transaction Type"
                    name="transactionType"
                    value={values.transactionType}
                    onChange={handleChange}
                    options={[
                      { value: 'buy', label: 'For Sale' },
                      { value: 'rent', label: 'For Rent' }
                    ]}
                  />
                  {values.transactionType === 'rent' && (
                    <Select
                      label="Rental Period"
                      name="rentalPeriod"
                      value={values.rentalPeriod}
                      onChange={handleChange}
                      options={[
                        { value: 'hour', label: 'Per Hour' },
                        { value: 'day', label: 'Per Day' },
                        { value: 'week', label: 'Per Week' },
                        { value: 'month', label: 'Per Month' }
                      ]}
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Quantity/Availability"
                  type="number"
                  name="quantity"
                  value={values.quantity}
                  onChange={handleChange}
                  placeholder="100"
                  required
                />
                <Input
                  label="Unit"
                  type="text"
                  name="unit"
                  value={values.unit}
                  onChange={handleChange}
                  placeholder="kg or item"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={values.transactionType === 'rent' ? "Rental Price (₹)" : "Selling Price (₹)"}
                  type="number"
                  step="0.01"
                  name="pricePerUnit"
                  value={values.pricePerUnit}
                  onChange={handleChange}
                  placeholder="25"
                  required
                />
                <Input
                  label="Min Order Qty"
                  type="number"
                  name="moq"
                  value={values.moq}
                  onChange={handleChange}
                  placeholder="1"
                  required
                />
              </div>

              <Input
                label="Available From"
                type="date"
                name="availableFrom"
                value={values.availableFrom}
                onChange={handleChange}
                required
              />

              {!isEquipmentForm && (
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={values.isOrganic}
                    onChange={(e) => handleChange({ target: { name: 'isOrganic', value: e.target.checked } })}
                    className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-text">Certified Organic Produce</span>
                </label>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl text-text font-medium bg-surface-2 hover:bg-surface-3 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl text-white font-medium bg-primary hover:bg-primary-dark transition-colors shadow-sm">
                  {editingListing ? 'Update Listing' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

export default MarketPage;
