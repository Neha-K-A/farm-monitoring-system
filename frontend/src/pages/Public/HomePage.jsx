import { Link } from 'react-router-dom';
import { Leaf, Droplets, Heart, DollarSign, Store, Zap, ArrowRight, Check } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#F4F9F6] selection:bg-[#2ECC71]/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-[#F1F3F5] z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-2 tracking-tighter">
            <span className="text-[#2ECC71]">🌱</span> BHUMISAKHI
          </h1>
          <div className="flex gap-6 items-center">
            <Link to="/services" className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] hover:text-[#2ECC71] transition-colors">OS Services</Link>
            <Link to="/login" className="px-8 py-3 rounded-2xl bg-white border border-[#E0E0E0] text-[10px] font-black text-[#1A1A2E] uppercase tracking-[0.2em] hover:shadow-lg transition-all active:scale-95">
              Secure Login
            </Link>
            <Link to="/signup" className="px-8 py-3 rounded-2xl bg-[#2ECC71] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:bg-[#27AE60] transition-all active:scale-95 shadow-lg shadow-[#2ECC71]/20">
              Deploy Instance
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen pt-32 flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#EAF9F1] rounded-full blur-[120px] -mr-96 -mt-96 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#EBF8FF] rounded-full blur-[100px] -ml-64 -mb-64 opacity-50"></div>

        <div className="text-center max-w-4xl relative z-10">
          <div className="inline-block px-4 py-2 bg-white border border-[#E0E0E0] rounded-full mb-8 shadow-sm">
            <p className="text-[10px] font-black text-[#2ECC71] uppercase tracking-[0.3em]">Next-Gen Agricultural Intelligence</p>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-[#1A1A2E] mb-8 tracking-tighter leading-[0.9]">
            The Core OS for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ECC71] to-[#27AE60]">Modern Farming</span>
          </h2>
          <p className="text-lg md:text-2xl text-[#636E72] mb-12 font-bold leading-relaxed max-w-2xl mx-auto">
            Neural-engine plant diagnosis, IoT real-time monitoring, and centralized financial analytics for high-yield operations.
          </p>
          <div className="flex gap-6 justify-center">
            <Link to="/signup" className="px-10 py-5 rounded-3xl bg-[#2ECC71] text-white font-black uppercase tracking-[0.2em] text-xs hover:shadow-2xl hover:translate-y-[-4px] transition-all flex items-center gap-3 shadow-xl shadow-[#2ECC71]/30 group">
              Initialize System <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/services" className="px-10 py-5 rounded-3xl bg-white border-2 border-[#E0E0E0] text-[#1A1A2E] font-black uppercase tracking-[0.2em] text-xs hover:border-[#2ECC71] hover:text-[#2ECC71] transition-all">
              Kernel Modules
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-24">
            <p className="text-[10px] font-black text-[#2ECC71] uppercase tracking-[0.5em] mb-4 text-center">System Capabilities</p>
            <h2 className="text-5xl font-black text-[#1A1A2E] tracking-tighter text-center">Enterprise Grade Modules</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: Leaf, title: 'Land Asset Management', desc: 'Holistic tracking for diverse crop portfolios and multi-farm clusters.' },
              { icon: Droplets, title: 'H2O Resource Optimization', desc: 'Precision irrigation metrics and real-time groundwater conservation analysis.' },
              { icon: Heart, title: 'Human Capital Vitality', desc: 'Advanced wellness monitoring and ergonomic workload synchronization for workforce.' },
              { icon: DollarSign, title: 'Economic Intelligence', desc: 'High-fidelity accounting, expenditure auditing, and profit projection engines.' },
              { icon: Store, title: 'Market Liquidity Hub', desc: 'Direct decentralized connectivity for seed logistics and product distribution.' },
              { icon: Zap, title: 'Neural Plant Diagnosis', desc: 'Real-time AI pathology identification via high-precision visual processing.' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="p-10 rounded-[2.5rem] bg-[#F8F9FA] border border-[#F1F3F5] hover:shadow-2xl hover:border-[#2ECC71]/30 hover:translate-y-[-8px] transition-all group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-[#2ECC71] group-hover:text-white transition-all">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-black text-[#1A1A2E] mb-4 tracking-tight group-hover:text-[#2ECC71] transition-colors">{feature.title}</h3>
                  <p className="text-[#636E72] font-bold leading-relaxed text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-[#1A1A2E] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2ECC71] opacity-10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tighter">Ready to Scale Your Harvest?</h2>
          <p className="text-xl mb-12 text-[#A0AEC0] font-bold max-w-2xl mx-auto leading-relaxed">Join the network of data-driven farmers deploying BhumiSakhi OS nodes across the globe.</p>
          <Link to="/signup" className="inline-block px-12 py-6 rounded-3xl bg-[#2ECC71] text-white font-black uppercase tracking-[0.3em] text-xs hover:shadow-2xl hover:bg-[#27AE60] hover:scale-105 transition-all shadow-xl shadow-[#2ECC71]/20">
            Initialize Your Node
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A2E] border-t border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <h1 className="text-2xl font-black text-white tracking-tighter">
            <span className="text-[#2ECC71]">🌱</span> BHUMISAKHI
          </h1>
          <p className="text-[#636E72] font-black uppercase tracking-[0.2em] text-[10px]">© 2026 BHUMISAKHI OS. PATENT PENDING. ALL SYSTEMS NOMINAL.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
