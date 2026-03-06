import { Leaf, Sprout, Sun, Flower, PackageCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

// Dummy data for Phase 4
const STAGES = [
    { id: 'seeded', label: 'Seeded', icon: Leaf },
    { id: 'sprouting', label: 'Sprouting', icon: Sprout },
    { id: 'vegetative', label: 'Vegetative', icon: Sun },
    { id: 'flowering', label: 'Flowering', icon: Flower },
    { id: 'harvest', label: 'Harvest Ready', icon: PackageCheck },
];

const mockFarms = [
    { id: 1, name: 'North Field 1', crop: 'Wheat', stageIndex: 3, health: 92 },
    { id: 2, name: 'South Sector B', crop: 'Cotton', stageIndex: 1, health: 85 },
    { id: 3, name: 'Greenhouse A', crop: 'Tomatoes', stageIndex: 4, health: 98 },
];

const CropGrowthProgress = () => {
    return (
        <div className="card mb-6">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-tight">Growth Lifecycle Monitor</h2>
                    <p className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] mt-1">Stochastic development metrics across decentralized field assets.</p>
                </div>
                <div className="bg-white text-[#2ECC71] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border border-[#F1F3F5] shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] shadow-[0_0_8px_#2ECC71] animate-pulse" />
                    LIVE SYNC
                </div>
            </div>

            <div className="space-y-6">
                {mockFarms.map((farm, index) => (
                    <motion.div
                        key={farm.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-[2rem] p-8 border border-[#F1F3F5] mb-6 hover:shadow-2xl transition-all group overflow-hidden relative"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F1F3F5] group-hover:bg-[#2ECC71] transition-colors"></div>
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-black text-[#1A1A2E] tracking-tight group-hover:text-[#2ECC71] transition-colors uppercase">{farm.name}</h3>
                                <p className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.3em] mt-1">{farm.crop} CULTIVAR</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${farm.health > 90 ? 'bg-[#EAF9F1] text-[#27AE60] border-[#C3E6CB] shadow-[0_0_15px_#2ECC71/10]' : 'bg-[#FFF8E1] text-[#F39C12] border-[#FFEBA1]'
                                    }`}>
                                    Vitality Index: {farm.health}%
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="relative pt-6 pb-2">
                            {/* Background Track */}
                            <div className="absolute top-9 left-0 w-full h-1.5 bg-[#E9ECEF] rounded-full" />

                            {/* Active Track */}
                            <div
                                className="absolute top-9 left-0 h-1.5 bg-[#2ECC71] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(46,204,113,0.3)]"
                                style={{ width: `${(farm.stageIndex / (STAGES.length - 1)) * 100}%` }}
                            />

                            {/* Stage Points */}
                            <div className="relative flex justify-between">
                                {STAGES.map((stage, i) => {
                                    const isCompleted = i <= farm.stageIndex;
                                    const isActive = i === farm.stageIndex;
                                    const Icon = stage.icon;

                                    return (
                                        <div key={stage.id} className="flex flex-col items-center">
                                            <div
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center relative z-10 transition-all duration-700 shadow-sm ${isActive ? 'bg-[#2ECC71] text-white ring-8 ring-[#2ECC71]/10 scale-110' :
                                                    isCompleted ? 'bg-[#1A1A2E] text-white' : 'bg-[#F4F6F9] text-[#CBD5E0]'
                                                    }`}
                                            >
                                                <Icon size={18} />
                                            </div>
                                            <span className={`text-[9px] mt-4 font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-[#2ECC71]' :
                                                isCompleted ? 'text-[#1A1A2E]' : 'text-[#CBD5E0]'
                                                }`}>
                                                {stage.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CropGrowthProgress;
