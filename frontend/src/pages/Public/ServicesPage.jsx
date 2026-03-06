import { Link } from 'react-router-dom';
import { Leaf, Droplets, Heart, DollarSign, Store, Zap, Cloud, Bug, BookOpen, Truck, MessageSquare, Lightbulb } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      icon: Leaf,
      title: 'Farm Management',
      description: 'Comprehensive farm tracking, soil monitoring, crop planning, and yield prediction.'
    },
    {
      icon: Cloud,
      title: 'Weather Insights',
      description: 'Real-time weather data, 5-day forecasts, and planting recommendations.'
    },
    {
      icon: Droplets,
      title: 'Water Management',
      description: 'Track irrigation usage, optimize water consumption, and improve efficiency.'
    },
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Monitor worker health, track workload, and provide wellness recommendations.'
    },
    {
      icon: DollarSign,
      title: 'Financial Tracking',
      description: 'Record expenses, income, and generate detailed financial reports and analysis.'
    },
    {
      icon: Store,
      title: 'Marketplace',
      description: 'Connect with buyers and sellers, list products, and manage transactions.'
    },
    {
      icon: Bug,
      title: 'Disease Detection',
      description: 'AI-powered crop disease identification with treatment recommendations.'
    },
    {
      icon: BookOpen,
      title: 'Government Schemes',
      description: 'Discover and access relevant government schemes and subsidy programs.'
    },
    {
      icon: Truck,
      title: 'Distributor Network',
      description: 'Find local distributors and suppliers for seeds, fertilizers, and equipment.'
    },
    {
      icon: MessageSquare,
      title: 'Notifications',
      description: 'Real-time alerts for weather, health, disease, and farm events.'
    },
    {
      icon: Lightbulb,
      title: 'AI Recommendations',
      description: 'Get personalized recommendations based on your farm conditions.'
    },
    {
      icon: Zap,
      title: 'By-Product Management',
      description: 'Track and monetize agricultural by-products effectively.'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-[#F1F3F5] z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-2 tracking-tighter">
            <span className="text-[#2ECC71]">🌱</span> BHUMISAKHI
          </h1>
          <Link to="/" className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] hover:text-[#2ECC71] transition-colors">
            ← Back to Origin
          </Link>
        </div>
      </nav>

      <div className="pt-20">
        {/* Header */}
        <div className="bg-[#1A1A2E] text-white py-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2ECC71] opacity-10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <p className="text-[10px] font-black text-[#2ECC71] uppercase tracking-[0.5em] mb-6 shadow-sm">Integrated Kernel Modules</p>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">BhumiSakhi <span className="text-[#2ECC71]">OS v2.0</span></h1>
            <p className="text-xl opacity-60 font-bold max-w-2xl mx-auto leading-relaxed">Unifying agricultural data, neural intelligence, and supply chain logistics into a single terminal.</p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="p-10 rounded-[2.5rem] bg-[#F8F9FA] border border-[#F1F3F5] hover:shadow-2xl hover:translate-y-[-8px] transition-all group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm text-[#1A1A2E] group-hover:bg-[#2ECC71] group-hover:text-white transition-all">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-black text-[#1A1A2E] mb-4 tracking-tight group-hover:text-[#2ECC71] transition-colors">{service.title}</h3>
                  <p className="text-[#636E72] font-bold leading-relaxed text-sm">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-[#F8F9FA] py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center mb-20">
              <p className="text-[10px] font-black text-[#2ECC71] uppercase tracking-[0.5em] mb-4">Strategic Advantages</p>
              <h2 className="text-4xl font-black text-[#1A1A2E] tracking-tighter text-center">Why Decouple from Legacy?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              {[
                'Neural-Insights for Pre-emptive Logistics',
                'Hyper-local IoT Telemetry Integration',
                'Worker-First Vitality & Workload Metrics',
                'Native Multi-Linguistic Interface Protocols',
                'Direct State Scheme API Integration',
                'Decentralized Marketplace Connectivity',
                'End-to-End Fiscal Transparency Engine',
                'Frictionless Mobile-First Micro-UI',
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-4 p-6 bg-white rounded-3xl border border-[#F1F3F5] shadow-sm hover:shadow-lg transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF9F1] text-[#2ECC71] flex items-center justify-center flex-shrink-0 group-hover:bg-[#2ECC71] group-hover:text-white transition-all">
                    <Check size={20} />
                  </div>
                  <p className="text-[#1A1A2E] font-black tracking-tight text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-32 px-6 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-5xl font-black text-[#1A1A2E] mb-10 tracking-tighter">
              Orchestrate Your <span className="text-[#2ECC71]">Farming Node</span>
            </h2>
            <p className="text-xl text-[#636E72] mb-12 font-bold max-w-2xl mx-auto leading-relaxed">
              Experience the efficiency of a centralized agricultural command center.
            </p>
            <Link to="/signup" className="inline-block px-12 py-6 rounded-3xl bg-[#2ECC71] text-white font-black uppercase tracking-[0.3em] text-xs hover:shadow-2xl hover:bg-[#27AE60] hover:scale-105 transition-all shadow-xl shadow-[#2ECC71]/20">
              Initialize Instance
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A2E] py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <h1 className="text-2xl font-black text-white tracking-tighter">
            <span className="text-[#2ECC71]">🌱</span> BHUMISAKHI
          </h1>
          <p className="text-[#636E72] font-black uppercase tracking-[0.2em] text-[10px]">© 2026 BHUMISAKHI OS. REVOLUTIONIZING APPLIED AGRONOMY.</p>
        </div>
      </footer>
    </div>
  );
};

export default ServicesPage;
