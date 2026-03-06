import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { useNotification } from '../../../hooks/useNotification.js';
import userService from '../../../services/userService';
import { User, MapPin, Bell, Cloud, Shield, Leaf, MonitorSmartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { user, login } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    farmSize: '',
    cropTypes: '',
    soilType: '',
    weatherAlerts: true,
    diseaseAlerts: true,
    marketAlerts: false,
    language: 'en',
    adviceLevel: 'basic'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setFormData({
          name: profile.name || '',
          phone: profile.phone || '',
          email: profile.email || '',
          location: profile.location?.state || '',
          farmSize: profile.farmPreferences?.farmSize || '',
          cropTypes: profile.farmPreferences?.cropTypes?.join(', ') || '',
          soilType: profile.farmPreferences?.soilType || '',
          weatherAlerts: profile.notifications?.weatherAlerts ?? true,
          diseaseAlerts: profile.notifications?.diseaseAlerts ?? true,
          marketAlerts: profile.notifications?.marketAlerts ?? false,
          language: profile.aiPreferences?.language || 'en',
          adviceLevel: profile.aiPreferences?.adviceLevel || 'basic'
        });
      } catch (err) {
        showNotification('Failed to load profile', 'error');
      }
    };
    fetchProfile();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        location: { state: formData.location },
        farmPreferences: {
          farmSize: formData.farmSize,
          cropTypes: formData.cropTypes.split(',').map(c => c.trim()),
          soilType: formData.soilType
        },
        notifications: {
          weatherAlerts: formData.weatherAlerts,
          diseaseAlerts: formData.diseaseAlerts,
          marketAlerts: formData.marketAlerts
        },
        aiPreferences: {
          language: formData.language,
          adviceLevel: formData.adviceLevel
        }
      };

      const updated = await userService.updateProfile(payload);
      showNotification('Settings saved successfully', 'success');
      // Update local storage/context if needed, but the main context might not hold all prefs
    } catch (err) {
      showNotification('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'farm', label: 'Farm Preferences', icon: Leaf },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Preferences', icon: MonitorSmartphone },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tighter uppercase">Kernel Configuration</h1>
        <p className="text-[#636E72] mt-2 font-black uppercase tracking-[0.3em] text-[10px]">Orchestrate your account identity and autonomous farm protocols.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-[#EAF9F1] text-[#2ECC71] font-bold border border-[#C3E6CB] shadow-sm'
                  : 'text-[#636E72] font-bold uppercase tracking-tight text-xs hover:bg-[#F8F9FA] hover:text-[#1A1A2E]'
                  }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Form */}
        <div className="col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="card !bg-[#FFFFFF] shadow-2xl !p-10 border-[#E0E0E0] rounded-[2rem] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2ECC71] to-[#27AE60]"></div>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Profile Section */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[#1A1A2E] border-b border-[#E0E0E0] pb-4 mb-8">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A2E] focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/10 outline-none transition-all font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A2E] focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/10 outline-none transition-all font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A2E] focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/10 outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-2">Location (State)</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A2E] focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/10 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Farm Preferences Section */}
              {activeTab === 'farm' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[#1A1A2E] border-b border-[#E0E0E0] pb-4 mb-8">Farm Preferences</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-2">Farm Size</label>
                      <select
                        name="farmSize"
                        value={formData.farmSize}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A2E] focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/10 outline-none transition-all font-medium"
                      >
                        <option value="">Select Size</option>
                        <option value="Less than 1 acre">&lt; 1 acre</option>
                        <option value="1-5 acres">1-5 acres</option>
                        <option value="5-10 acres">5-10 acres</option>
                        <option value="More than 10 acres">&gt; 10 acres</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-2">Crop Types (comma separated)</label>
                      <input
                        type="text"
                        name="cropTypes"
                        placeholder="e.g. Wheat, Rice, Cotton"
                        value={formData.cropTypes}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A2E] focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/10 outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-2">Soil Type</label>
                      <select
                        name="soilType"
                        value={formData.soilType}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A2E] focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/10 outline-none transition-all font-medium"
                      >
                        <option value="">Select Soil Type</option>
                        <option value="Clay">Clay</option>
                        <option value="Sandy">Sandy</option>
                        <option value="Loam">Loam</option>
                        <option value="Silt">Silt</option>
                        <option value="Black">Black Soil</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[#1A1A2E] border-b border-[#E0E0E0] pb-4 mb-8">Notifications</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="weatherAlerts"
                        checked={formData.weatherAlerts}
                        onChange={handleChange}
                        className="w-5 h-5 accent-[#2ECC71] border-border bg-surface rounded"
                      />
                      <span className="text-[#1A1A2E] font-medium text-sm">Weather & Adverse Climate Alerts</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="diseaseAlerts"
                        checked={formData.diseaseAlerts}
                        onChange={handleChange}
                        className="w-5 h-5 accent-[#2ECC71] border-border bg-surface rounded"
                      />
                      <span className="text-[#1A1A2E] font-medium text-sm">Crop Disease & Vision Alerts</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="marketAlerts"
                        checked={formData.marketAlerts}
                        onChange={handleChange}
                        className="w-5 h-5 accent-[#2ECC71] border-border bg-surface rounded"
                      />
                      <span className="text-[#1A1A2E] font-medium text-sm">Market Price Updates & Subsidies</span>
                    </label>
                  </div>
                </div>
              )}

              {/* AI Preferences Section */}
              {activeTab === 'ai' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[#1A1A2E] border-b border-[#E0E0E0] pb-4 mb-8">AI Preferences</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-2">Preferred Language</label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A2E] focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/10 outline-none transition-all font-medium"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="mr">Marathi (मराठी)</option>
                        <option value="te">Telugu (తెలుగు)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-2">Advice Detail Level</label>
                      <select
                        name="adviceLevel"
                        value={formData.adviceLevel}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A2E] focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/10 outline-none transition-all font-medium"
                      >
                        <option value="basic">Basic (Summary only)</option>
                        <option value="detailed">Detailed (In-depth scientific facts)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-[#E0E0E0] flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 bg-[#2ECC71] text-white font-bold rounded-xl hover:bg-[#27AE60] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
