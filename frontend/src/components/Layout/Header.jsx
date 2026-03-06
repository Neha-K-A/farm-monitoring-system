import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import authService from '../../services/authService.js';
import localStorage_API from '../../utils/localStorage.js';
import { motion, AnimatePresence } from 'framer-motion';

// Debounce helper
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const Header = ({ pageTitle = 'Dashboard', iotData = {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success } = useNotification();
  const [showMenu, setShowMenu] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [notifCount] = useState(3);

  const handleSearch = useCallback(
    debounce((val) => {
      console.log('Search:', val);
    }, 400),
    []
  );

  const handleLogout = async () => {
    try { await authService.logout(); } catch (_) { }
    logout();
    localStorage_API.clearTokens();
    localStorage_API.clearUser();
    success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AG';

  return (
    <header
      className="fixed top-3 right-3 z-40 flex items-center justify-between px-6"
      style={{
        left: 'calc(72px + 24px)',
        height: '64px',
        background: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Left: Page title */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-[#1A1A2E] font-black text-xl leading-tight tracking-tighter uppercase">{pageTitle}</h1>
          <p className="text-[#A0AEC0] text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* IoT live pill */}
        {iotData.soilMoisture && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-[#F1F3F5] shadow-sm"
          >
            <span className="live-dot" style={{ width: 6, height: 6, background: '#2ECC71', boxShadow: '0 0 8px #2ECC71' }} />
            <span className="text-[#1A1A2E]">SOIL {Math.round(iotData.soilMoisture)}%</span>
            <span className="w-px h-3 bg-[#E0E0E0]"></span>
            <span className="text-[#2ECC71]">{Math.round(iotData.temperature || 28)}°C</span>
          </motion.div>
        )}
      </div>

      {/* Right: Search + actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="search-pill hidden sm:flex">
          <Search size={14} className="text-[#636E72] flex-shrink-0" />
          <input
            placeholder="Search farms, crops..."
            value={searchVal}
            onChange={e => {
              setSearchVal(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </div>

        {/* Settings */}
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#636E72] hover:text-[#1A1A2E] hover:bg-[#F4F6F9] transition-all"
        >
          <Settings size={17} />
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notification')}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#636E72] hover:text-[#1A1A2E] hover:bg-[#F4F6F9] transition-all"
        >
          <Bell size={17} />
          {notifCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{ background: '#ef4444', color: 'white' }}
            >
              {notifCount}
            </span>
          )}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(s => !s)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#F4F6F9] transition-all"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)' }}
            >
              {user?.profilePhoto
                ? <img src={user.profilePhoto} alt="" className="w-full h-full rounded-lg object-cover" />
                : initials
              }
            </div>
            <ChevronDown size={13} className="text-[#636E72]" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 rounded-xl py-1 z-50 bg-[#FFFFFF] border border-[#E0E0E0] shadow-xl"
                style={{
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="px-3 py-2 border-b border-[#F4F6F9]">
                  <p className="text-[#1A1A2E] text-sm font-bold">{user?.name || 'Farmer'}</p>
                  <p className="text-[#636E72] text-xs truncate">{user?.email || 'farmer@agri.com'}</p>
                </div>
                {[
                  { label: 'View Profile', icon: User, action: () => { navigate('/profile'); setShowMenu(false); } },
                  { label: 'Settings', icon: Settings, action: () => { navigate('/profile'); setShowMenu(false); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#636E72] hover:text-[#1A1A2E] hover:bg-[#F4F6F9] transition-all"
                  >
                    <item.icon size={14} /> {item.label}
                  </button>
                ))}
                <div className="border-t border-white/5 mt-1" />
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={14} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
