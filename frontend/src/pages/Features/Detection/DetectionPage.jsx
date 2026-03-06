import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Button from '../../../components/Common/Button.jsx';
import Modal from '../../../components/Common/Modal.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import detectionService from '../../../services/detectionService.js';
import { Leaf, Upload, Settings, Activity, Clock, FileScan, CheckCircle2, AlertTriangle, Bug } from 'lucide-react';

const DetectionPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { success, error: notifyError } = useNotification();

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await detectionService.getResults();
      setResults(data || []);
    } catch (err) {
      notifyError('Failed to load detection results');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      notifyError('Please select a file');
      return;
    }

    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('image', selectedFile);

      await detectionService.detectFromImage(formData);
      success('Image analyzed successfully!');
      setShowUpload(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      loadResults();
    } catch (err) {
      notifyError('Detection failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading && results.length === 0) return <Loader />;

  return (
    <MainLayout pageTitle="Plant Diagnosis">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] border border-[#E0E0E0] shadow-sm mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
              <Leaf className="text-[#2ECC71]" size={36} />
              Botanical Diagnosis Engine
            </h1>
            <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Neural network analysis for rapid plant pathology detection and mitigation strategy.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowUpload(true)}
              className="bg-[#2ECC71] hover:bg-[#27AE60] text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-lg active:scale-95"
            >
              <Upload size={18} /> INITIATE SCAN
            </button>
            <button className="bg-white border border-[#E0E0E0] hover:bg-[#F8F9FA] text-[#1A1A2E] px-5 py-3.5 rounded-2xl transition-all shadow-sm active:scale-90">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Diagnosis Results */}
        <div>
          <h2 className="text-xl font-black text-[#1A1A2E] flex items-center gap-3 mb-8 uppercase tracking-widest">
            <span className="w-8 h-px bg-[#E0E0E0]"></span>
            DIAGNOSTIC ARCHIVE
          </h2>
          {results.length === 0 ? (
            <EmptyState
              title="No diagnoses yet"
              description="Upload a photo of a leaf or plant to get started."
              action={
                <Button onClick={() => setShowUpload(true)} className="mt-4">
                  <Upload size={20} className="mr-2" /> Upload Photo
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {results.map((result, idx) => {
                  const isHealthy = result.condition === 'Healthy' || result.detectedClass?.toLowerCase() === 'healthy';

                  return (
                    <motion.div
                      key={result._id || idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-[1.5rem] border border-[#E0E0E0] overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#2ECC71]/50 transition-all flex flex-col group"
                    >
                      <div className={`p-6 flex items-center gap-4 border-b border-[#F1F3F5] ${isHealthy ? 'bg-[#EAF9F1]/50' : 'bg-[#FFF5F5]/50'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isHealthy ? 'bg-white text-[#2ECC71]' : 'bg-white text-[#E53E3E]'}`}>
                          {isHealthy ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-black text-xl tracking-tight ${isHealthy ? 'text-[#155724]' : 'text-[#721C24]'}`}>
                            {result.detectedClass || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-[#636E72] uppercase tracking-widest">Confidence Index</span>
                            <Badge className={`!rounded-lg !px-2 !py-0.5 font-black text-[9px] border ${isHealthy ? '!bg-[#EAF9F1] !text-[#2ECC71] border-[#C3E6CB]' : '!bg-[#FFF5F5] !text-[#E53E3E] border-[#FED7D7]'}`}>
                              {Math.round(result.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col gap-5 bg-white">
                        {result.treatmentSuggested && result.treatmentSuggested !== 'None required.' && (
                          <div className="bg-[#FFF9DB] border border-[#FAF089] rounded-2xl p-4 shadow-sm">
                            <p className="text-[9px] font-black text-[#856404] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                              <Bug size={14} className="text-[#E67E22]" /> Mitigation Strategy
                            </p>
                            <p className="text-sm text-[#856404] font-bold leading-relaxed">
                              {result.treatmentSuggested}
                            </p>
                          </div>
                        )}

                        {result.prevention && (
                          <div className="bg-[#EBF8FF] border border-[#BEE3F8] rounded-2xl p-4 shadow-sm">
                            <p className="text-[9px] font-black text-[#2B6CB0] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                              <Leaf size={14} className="text-[#3182CE]" /> Prophylaxis Protocol
                            </p>
                            <p className="text-sm text-[#2B6CB0] font-bold leading-relaxed">
                              {result.prevention}
                            </p>
                          </div>
                        )}

                        {!result.prevention && !result.treatmentSuggested && isHealthy && (
                          <div className="flex-1 flex items-center justify-center text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest italic pt-4">
                            PHYTOSANITARY CLEARANCE GRANTED
                          </div>
                        )}
                      </div>

                      <div className="px-6 py-4 bg-[#F8F9FA] border-t border-[#F1F3F5] flex justify-between items-center text-[10px] text-[#636E72] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#A0AEC0]" /> {new Date(result.timestamp).toLocaleDateString()}</span>
                        <span className="text-[#A0AEC0]">{new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <Modal
            title="Upload Plant Photo"
            onClose={() => {
              if (isAnalyzing) return;
              setShowUpload(false);
              setSelectedFile(null);
              setPreviewUrl(null);
            }}
          >
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div
                className={`relative border-2 border-dashed rounded-[1.5rem] p-12 text-center transition-all
                  ${previewUrl ? 'border-[#2ECC71] bg-[#EAF9F1]/30' : 'border-[#E0E0E0] hover:border-[#2ECC71]/50 bg-[#F8F9FA]'}
                `}
              >
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={isAnalyzing}
                />

                {previewUrl ? (
                  <div className="space-y-6">
                    <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-2xl shadow-2xl border-4 border-white" />
                    <span className="inline-block bg-white px-5 py-2 rounded-xl text-[10px] font-black text-[#1A1A2E] shadow-sm uppercase tracking-widest border border-[#F1F3F5]">
                      {selectedFile.name}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4 pointer-events-none">
                    <div className="w-20 h-20 bg-white border border-[#E0E0E0] rounded-[1.5rem] flex items-center justify-center mx-auto shadow-sm mb-6 text-[#2ECC71]">
                      <FileScan size={40} />
                    </div>
                    <p className="font-black text-[#1A1A2E] text-2xl tracking-tighter">DEPOSIT BIOMETRIC DATA</p>
                    <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">Tap or drag botanical imagery for high-fidelity neural processing.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpload(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  disabled={isAnalyzing}
                  className="flex-1 px-6 py-4 rounded-xl border border-[#E0E0E0] text-[#636E72] font-black uppercase tracking-widest text-[10px] hover:bg-[#F8F9FA] transition-all disabled:opacity-50"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isAnalyzing}
                  className="flex-1 bg-[#2ECC71] text-white font-black uppercase tracking-widest text-[10px] px-6 py-4 rounded-xl hover:bg-[#27AE60] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-lg active:scale-95"
                >
                  {isAnalyzing ? (
                    <><Loader size={18} /> PROCESSING...</>
                  ) : (
                    <><Sparkles size={18} /> INITIATE DIAGNOSIS</>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

// Hack for Sparkles since omitted at top
const Sparkles = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
)

export default DetectionPage;
