import { motion } from 'framer-motion';

const CROPS = [
    { key: 'wheat', label: 'Wheat', color: '#f59e0b' },
    { key: 'rice', label: 'Rice', color: '#22c55e' },
    { key: 'maize', label: 'Maize', color: '#38bdf8' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

// Default prediction data — replaced by API data when available
const DEFAULT_DATA = [
    { month: 'Jan', wheat: 72, rice: 55, maize: 40 },
    { month: 'Feb', wheat: 68, rice: 62, maize: 45 },
    { month: 'Mar', wheat: 81, rice: 58, maize: 52 },
    { month: 'Apr', wheat: 75, rice: 70, maize: 48 },
    { month: 'May', wheat: 88, rice: 65, maize: 60 },
    { month: 'Jun', wheat: 85, rice: 73, maize: 55 },
];

const MiniBar = ({ value, color, delay }) => (
    <div className="flex items-center gap-1.5">
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-[#F4F6F9] border border-[#E0E0E0]">
            <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ delay, duration: 0.8, ease: 'easeOut' }}
            />
        </div>
        <span className="text-[#636E72] text-[10px] font-bold w-6 text-right">{value}%</span>
    </div>
);

const PredictionCards = ({ predictions = [] }) => {
    const data = predictions.length >= 4 ? predictions : DEFAULT_DATA;

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-[#1A1A2E] font-black text-xl uppercase tracking-tighter leading-tight">Predictive Yield Telemetry</h3>
                    <p className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] mt-1">Stochastic monthly output projections based on historical datasets.</p>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4">
                    {CROPS.map(c => (
                        <div key={c.key} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ background: c.color }} />
                            <span className="text-[#1A1A2E] text-[9px] font-black uppercase tracking-[0.15em]">{c.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {data.slice(0, 6).map((row, i) => (
                    <motion.div
                        key={row.month}
                        className="flex flex-col gap-4 p-5 rounded-[1.5rem] bg-white border border-[#F1F3F5] shadow-sm hover:shadow-xl transition-all group"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 + i * 0.06, duration: 0.35 }}
                    >
                        <p className="text-[#1A1A2E] text-[10px] font-black uppercase tracking-[0.3em] border-b border-[#F1F3F5] pb-3 mb-1 group-hover:text-[#2ECC71] transition-colors">{row.month}</p>
                        {CROPS.map((c, ci) => (
                            <MiniBar
                                key={c.key}
                                value={row[c.key] || 0}
                                color={c.color}
                                delay={0.4 + i * 0.06 + ci * 0.04}
                            />
                        ))}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default PredictionCards;
