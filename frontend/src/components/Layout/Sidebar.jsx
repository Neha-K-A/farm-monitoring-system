import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, Layers, Scissors,
  DollarSign, Cloud, Settings, Leaf, ScanLine,
  Bell, Sprout, ChevronRight, Eye, Activity, Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'sensors', label: 'Sensors', icon: Activity, path: '/sensors' },
  { id: 'farm', label: 'Fields', icon: Layers, path: '/farm' },
  { id: 'crop', label: 'Harvesting', icon: Scissors, path: '/crop' },
  { id: 'finance', label: 'Finances', icon: DollarSign, path: '/finance' },
  { id: 'weather', label: 'Weather', icon: Cloud, path: '/weather' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, path: '/ai-assistant' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/profile' },
  { id: 'detection', label: 'Crops', icon: Leaf, path: '/detection' },
  { id: 'vision', label: 'Vision Monitor', icon: Eye, path: '/vision' },
  { id: 'notification', label: 'Alerts', icon: Bell, path: '/notification' },
  { id: 'scheme', label: 'Schemes', icon: Sprout, path: '/scheme' },
];

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="fixed left-3 top-3 bottom-3 z-50 flex flex-col rounded-2xl overflow-hidden shadow-sm"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E0E0E0'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 15px rgba(34,197,94,0.4)' }}
        >
          <Sprout size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-[#1A1A2E] font-black text-sm leading-tight tracking-tighter uppercase">BHOOMISAKHI</p>
              <p className="text-[#2ECC71] text-[9px] font-black uppercase tracking-[0.2em]">Autonomous OS</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <Link key={item.id} to={item.path}>
              <motion.div
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                title={!expanded ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-[11px] font-black uppercase tracking-[0.15em] flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && expanded && (
                  <ChevronRight size={14} className="text-[#2ECC71] flex-shrink-0" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-2 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="live-dot flex-shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2ECC71]"
              >
                Telemetry Active
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
