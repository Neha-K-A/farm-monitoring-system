import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, Loader, CheckCircle, AlertCircle, Leaf, Zap } from 'lucide-react';
import api from '../services/api.js';

const CropDetectionPanel = () => {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragging, setDragging] = useState(false);
    const fileRef = useRef(null);
    const cameraRef = useRef(null);

    const handleFile = (f) => {
        if (!f) return;
        // Compression: if > 2MB, use canvas
        const url = URL.createObjectURL(f);
        setPreview(url);
        setFile(f);
        setResult(null);
        setError(null);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f && f.type.startsWith('image/')) handleFile(f);
    }, []);

    const handleDetect = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const token = localStorage.getItem('accessToken');
            const { data } = await api.post('/detection/detect/image', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            // Backend returns ApiResponse wrapping DetectionLog
            const det = data?.data || data;
            setResult({
                detectedClass: det.detectedClass || det.detected_class || 'Unknown',
                confidence: det.confidence || 0,
                treatment: det.treatmentSuggested || det.treatment || 'Consult agricultural expert',
                condition: det.condition || (det.confidence > 0.6 ? 'Possibly Diseased' : 'Appears Healthy'),
            });
        } catch (err) {
            setError(err?.response?.data?.message || 'Detection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openCamera = () => { if (cameraRef.current) cameraRef.current.click(); };
    const clear = () => { setPreview(null); setFile(null); setResult(null); setError(null); };

    const conditionColor = result?.condition?.toLowerCase().includes('disease') || result?.condition?.toLowerCase().includes('damage')
        ? '#ef4444' : '#22c55e';

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-[#F1F3F5] shadow-sm">
                        <Zap size={18} className="text-[#2ECC71]" />
                    </div>
                    <div>
                        <h3 className="text-[#1A1A2E] font-black text-lg uppercase tracking-tighter">Health Diagnostic Engine</h3>
                        <p className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] mt-1">Autonomous neural scan for pathological crop signatures.</p>
                    </div>
                </div>
                {preview && (
                    <button onClick={clear} className="text-[#636E72] hover:text-[#1A1A2E] transition-colors">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Drop zone / preview */}
            {!preview ? (
                <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center gap-4 rounded-xl p-8 cursor-pointer transition-all"
                    style={{
                        border: `2px dashed ${dragging ? '#2ECC71' : '#E0E0E0'}`,
                        background: dragging ? '#EAF9F1' : '#F8F9FA',
                        minHeight: 200,
                    }}
                    onClick={() => fileRef.current?.click()}
                >
                    <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center bg-white border border-[#F1F3F5] shadow-2xl relative">
                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#2ECC71]/10 to-transparent"></div>
                        <Leaf size={32} className="text-[#2ECC71] animate-float relative z-10" />
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[#1A1A2E] text-sm font-black uppercase tracking-tight">Ingest Visual Data</p>
                        <p className="text-[#636E72] text-[9px] mt-1 font-black uppercase tracking-[0.2em] opacity-60">Neural processing requires high-fidelity imagery.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                            className="flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white text-[#1A1A2E] border border-[#F1F3F5] shadow-sm hover:border-[#2ECC71]/40"
                        >
                            <Upload size={14} /> Local File
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); openCamera(); }}
                            className="flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[#1A1A2E] text-white shadow-xl hover:bg-[#2D3436]"
                        >
                            <Camera size={14} /> Optical Lens
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden mb-3 shadow-md" style={{ height: 200 }}>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
            )}

            {/* Hidden inputs */}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleFile(e.target.files?.[0])} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => handleFile(e.target.files?.[0])} />

            {/* Detect button */}
            {file && !result && (
                <motion.button
                    onClick={handleDetect}
                    disabled={loading}
                    className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-lg"
                    style={{ background: loading ? '#A5D6A7' : 'linear-gradient(135deg, #2ecc71, #27ae60)', boxShadow: '0 8px 20px rgba(46,204,113,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {loading ? <><Loader size={15} className="animate-spin" /> Analyzing...</> : <><Zap size={15} /> Detect Disease</>}
                </motion.button>
            )}

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mt-4 flex items-start gap-3 p-4 rounded-xl text-sm"
                        style={{ background: '#FDEDEC', border: '1px solid #FADBD8', color: '#E74C3C' }}>
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 rounded-xl overflow-hidden"
                        style={{ border: `1px solid ${conditionColor}30` }}
                    >
                        {/* Result header */}
                        <div className="flex items-center gap-2 px-3 py-2"
                            style={{ background: `${conditionColor}10` }}>
                            <CheckCircle size={14} style={{ color: conditionColor }} />
                            <p className="text-xs font-semibold" style={{ color: conditionColor }}>Analysis Complete</p>
                            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${conditionColor}20`, color: conditionColor }}>
                                {Math.round(result.confidence * 100)}% conf.
                            </span>
                        </div>

                        <div className="p-3 space-y-2">
                            {[
                                { label: 'Detected', value: result.detectedClass },
                                { label: 'Condition', value: result.condition },
                            ].map(row => (
                                <div key={row.label} className="flex items-center justify-between">
                                    <span className="text-[#636E72] text-xs font-bold uppercase tracking-tight">{row.label}</span>
                                    <span className="text-[#1A1A2E] text-xs font-bold capitalize">{row.value}</span>
                                </div>
                            ))}
                            <div className="pt-3 border-t border-[#E0E0E0]">
                                <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-wider mb-1.5">Treatment Suggestion</p>
                                <p className="text-[#2ECC71] text-xs leading-relaxed font-bold">{result.treatment}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CropDetectionPanel;
