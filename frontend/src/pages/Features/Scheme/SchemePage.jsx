import { useEffect, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Modal from '../../../components/Common/Modal.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import schemeService from '../../../services/schemeService.js';
import { BookOpen, ExternalLink, CheckCircle, IndianRupee, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SchemePage = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [simulationState, setSimulationState] = useState(null); // 'checking' | 'processing' | 'approved' | 'transferred'
  const { showNotification } = useNotification();

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const allSchemes = await schemeService.getSchemes();
      setSchemes(allSchemes || []);
    } catch (err) {
      showNotification('Failed to load schemes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startSimulation = (scheme) => {
    setSelectedScheme(scheme);
    setSimulationState('checking');

    setTimeout(() => setSimulationState('processing'), 1500);
    setTimeout(() => setSimulationState('approved'), 3000);
    setTimeout(() => setSimulationState('transferred'), 4500);
  };

  const closeModal = () => {
    if (simulationState === 'transferred') {
      showNotification(`Successfully applied for ${selectedScheme?.name}!`, 'success');
    }
    setSelectedScheme(null);
    setSimulationState(null);
  };

  if (loading) return <Loader />;

  return (
    <MainLayout pageTitle="Government Schemes">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
              <BookOpen className="text-[#2ECC71]" size={32} />
              Govt. Intelligence & Schemes
            </h1>
            <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">
              Explore and apply for subsidies, loans, and agricultural grants in real-time.
            </p>
          </div>
        </div>

        {schemes.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E0E0E0] shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-[#E0E0E0] mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A2E]">No dynamic schemes found</h3>
            <p className="text-[#636E72] mt-1 font-medium">Check back later for new government intelligence and schemes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schemes.map((scheme) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={scheme._id} className="card !p-0 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="bg-[#F8F9FA] px-6 py-4 border-b border-[#E0E0E0] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#1A1A2E] truncate mr-2 tracking-tight">{scheme.name}</h3>
                    <span className="px-3 py-1 bg-[#2ECC71] text-[#FFFFFF] text-[10px] font-black rounded-lg uppercase tracking-widest whitespace-nowrap">
                      {scheme.category || 'Subsidy'}
                    </span>
                  </div>
                  <div className="p-6">
                    <p className="text-[#636E72] text-sm mb-6 min-h-[40px] font-medium leading-relaxed">{scheme.description}</p>

                    <div className="space-y-4 mb-6">
                      <div className="bg-[#F8F9FA] rounded-xl p-5 border border-[#E0E0E0]">
                        <div className="flex items-center gap-2 mb-3 text-[#1A1A2E] font-bold uppercase tracking-tight text-xs">
                          <CheckCircle size={14} className="text-[#2ECC71]" /> Eligibility Criteria
                        </div>
                        <ul className="list-disc list-inside text-sm text-[#636E72] space-y-2 font-medium">
                          {Array.isArray(scheme.eligibility) ? scheme.eligibility.map((item, i) => (
                            <li key={i}>{item}</li>
                          )) : <li>{scheme.eligibility}</li>}
                        </ul>
                      </div>

                      <div className="bg-[#F8F9FA] rounded-xl p-5 border border-[#E0E0E0]">
                        <div className="flex items-center gap-2 mb-3 text-[#1A1A2E] font-bold uppercase tracking-tight text-xs">
                          <FileText size={14} className="text-[#3498DB]" /> Financial Benefits
                        </div>
                        <p className="text-sm text-[#636E72] font-medium leading-relaxed">{scheme.benefits}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm font-bold bg-[#EAF9F1] p-4 rounded-xl border border-[#C3E6CB] shadow-sm">
                        <span className="text-[#1A1A2E] uppercase tracking-wider text-[10px]">Subsidy Potential:</span>
                        <span className="text-[#2ECC71] flex items-center text-lg">
                          <IndianRupee size={16} className="mr-0.5" />
                          {scheme.subsidyAmount ? scheme.subsidyAmount.toLocaleString('en-IN') : 'Variable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto px-6 pb-6 pt-6 border-t border-[#E0E0E0] bg-[#FFFFFF]">
                  <button
                    onClick={() => startSimulation(scheme)}
                    className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                  >
                    Apply Now
                  </button>
                  {scheme.officialLink && (
                    <a
                      href={scheme.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-transparent hover:bg-[#F8F9FA] text-[#1A1A2E] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-[#E0E0E0]"
                    >
                      <ExternalLink size={18} /> Official Site
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Application Simulation Modal */}
      <AnimatePresence>
        {selectedScheme && (
          <Modal isOpen={true} title="Scheme Application" onClose={closeModal}>
            <div className="p-6">
              <h3 className="text-xl font-bold text-text mb-6">Applying for {selectedScheme.name}</h3>

              <div className="space-y-6">
                <SimulationStep
                  active={simulationState === 'checking' || simulationState === 'processing' || simulationState === 'approved' || simulationState === 'transferred'}
                  completed={simulationState === 'processing' || simulationState === 'approved' || simulationState === 'transferred'}
                  label="Checking eligibility..."
                />
                <SimulationStep
                  active={simulationState === 'processing' || simulationState === 'approved' || simulationState === 'transferred'}
                  completed={simulationState === 'approved' || simulationState === 'transferred'}
                  label="Processing application via API..."
                />
                <SimulationStep
                  active={simulationState === 'approved' || simulationState === 'transferred'}
                  completed={simulationState === 'transferred'}
                  label="Application approved! ✅"
                />
                <SimulationStep
                  active={simulationState === 'transferred'}
                  completed={simulationState === 'transferred'}
                  label="Subsidy transferred successfully 💸"
                  isLast={true}
                />
              </div>

              {simulationState === 'transferred' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4 text-center"
                >
                  <p className="text-green-800 font-bold mb-2">Application Successful!</p>
                  <div className="text-sm text-green-700 flex flex-col gap-1">
                    <span><strong>Status:</strong> Eligible & Approved</span>
                    {selectedScheme.subsidyAmount > 0 && (
                      <span><strong>Amount Credited:</strong> ₹{selectedScheme.subsidyAmount.toLocaleString()}</span>
                    )}
                    <span><strong>Expected Credit Date:</strong> {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={closeModal}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

const SimulationStep = ({ active, completed, label, isLast }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${completed ? 'bg-primary text-white' :
          active ? 'bg-accent text-white animate-pulse' : 'bg-surface-3 text-muted'
          }`}>
          {completed ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-8 mt-2 transition-colors duration-300 ${completed ? 'bg-primary' : 'bg-surface-3'}`} />
        )}
      </div>
      <p className={`mt-1 font-medium transition-colors duration-300 ${completed ? 'text-text' :
        active ? 'text-primary' : 'text-muted'
        }`}>
        {label}
      </p>
    </div>
  );
};

export default SchemePage;
