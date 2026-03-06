import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DEFAULT_COSTS = [
    { name: 'Wheat Harvest', value: 42000, color: '#f59e0b' },
    { name: 'Rice Harvest', value: 31000, color: '#22c55e' },
    { name: 'Fertilizer', value: 15000, color: '#3b82f6' },
    { name: 'Labor', value: 18000, color: '#8b5cf6' },
    { name: 'Equipment', value: 9000, color: '#ef4444' },
];

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div className="px-4 py-2.5 rounded-xl text-xs bg-[#FFFFFF] border border-[#E0E0E0] shadow-xl">
            <p className="font-bold text-[#1A1A2E] mb-1">{d.name}</p>
            <p className="font-bold text-sm" style={{ color: d.payload.color }}>₹{d.value.toLocaleString()}</p>
        </div>
    );
};

const CustomLegend = ({ data }) => (
    <div className="flex flex-col gap-2 mt-4">
        {data.map(entry => (
            <div key={entry.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F9FA] transition-all group">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ background: entry.color }} />
                    <span className="text-[#636E72] text-[10px] font-black uppercase tracking-[0.1em] group-hover:text-[#1A1A2E] transition-colors">{entry.name}</span>
                </div>
                <span className="text-[#1A1A2E] text-xs font-black tracking-tight">₹{entry.value.toLocaleString()}</span>
            </div>
        ))}
    </div>
);

const CostChart = ({ costData = [] }) => {
    const data = costData.length ? costData : DEFAULT_COSTS;
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <motion.div
            className="card flex flex-col"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-[#1A1A2E] font-black text-lg uppercase tracking-tighter">Harvest Liquidity</h3>
                    <p className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] mt-1">Resource allocation by category</p>
                </div>
                <div className="text-right">
                    <p className="text-[#636E72] text-[9px] font-black uppercase tracking-[0.3em] opacity-60">AGGREGATE</p>
                    <p className="text-[#2ECC71] text-2xl font-black tracking-tighter">₹{total.toLocaleString()}</p>
                </div>
            </div>

            {/* Pie chart */}
            <div style={{ width: '100%', height: 180, minHeight: 180, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%" cy="50%"
                            innerRadius={48}
                            outerRadius={78}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <CustomLegend data={data} />
        </motion.div>
    );
};

export default CostChart;
