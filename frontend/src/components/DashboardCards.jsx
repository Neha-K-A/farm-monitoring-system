import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, RadioReceiver, Plane, HeartPulse, Droplets, ThermometerSun, CloudRain, Activity } from 'lucide-react';
import wsService from '../services/websocket.js';

const CircularProgress = ({ value = 0, max = 100, color = '#22c55e', size = 64, strokeWidth = 5 }) => {
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min(value / max, 1);
    const offset = circumference - pct * circumference;

    return (
        <svg width={size} height={size} className="progress-circle">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} stroke="#E9ECEF" />
            <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                stroke={color}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ filter: `drop-shadow(0 0 6px ${color}60)`, transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
            <text
                x="50%" y="50%"
                dominantBaseline="middle" textAnchor="middle"
                fill="#1A1A2E" fontSize="10" fontWeight="900"
                style={{ transform: 'rotate(90deg)', transformOrigin: 'center', letterSpacing: '0.05em' }}
            >
                {Math.round(pct * 100)}%
            </text>
        </svg>
    );
};

const MetricCard = ({ label, value, unit, color, Icon, isGauge, max = 100, delay = 0 }) => (
    <motion.div
        className="card flex flex-col p-6"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
    >
        <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                    style={{ background: `${color}10`, border: `1px solid ${color}20` }}
                >
                    <Icon size={18} style={{ color }} />
                </div>
                <p className="text-[#636E72] text-[9px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
                <div className="flex items-end gap-1">
                    <AnimatePresence mode="popLayout">
                        <motion.p
                            key={value}
                            initial={{ y: -5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-[#1A1A2E] text-3xl font-black leading-none tracking-tighter"
                        >
                            {value}
                        </motion.p>
                    </AnimatePresence>
                    {unit && <span className="text-[#A0AEC0] text-xs font-black uppercase tracking-widest mb-1">{unit}</span>}
                </div>
            </div>
            {isGauge && (
                <motion.div
                    key={value}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    <CircularProgress value={value} max={max} color={color} />
                </motion.div>
            )}
            {!isGauge && (
                <div className="flex items-center gap-2 mt-2 bg-[#F8F9FA] px-3 py-1.5 rounded-lg border border-[#F1F3F5]">
                    <span className="live-dot" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                    <span className="text-[9px] uppercase font-black tracking-widest text-[#636E72]">Active</span>
                </div>
            )}
        </div>
    </motion.div>
);

const DashboardCards = () => {
    const [mockData, setMockData] = useState({
        moisture: 63,
        temperature: 28,
        humidity: 45,
        waterTank: 72,
        cropHealth: 87,
    });

    useEffect(() => {
        wsService.connect();
        const unsubscribe = wsService.subscribe((data) => {
            if (data.type === 'iot_update') {
                setMockData(prev => ({ ...prev, ...data.payload }));
            }
        });
        return () => unsubscribe();
    }, []);

    const cards = [
        { label: 'Total Farms', value: 3, color: '#3b82f6', Icon: Map, isGauge: false },
        { label: 'Active Sensors', value: 12, color: '#f59e0b', Icon: RadioReceiver, isGauge: false },
        { label: 'Drone Status', value: 'Active', color: '#8b5cf6', Icon: Plane, isGauge: false },
        { label: 'Crop Health', value: mockData.cropHealth, unit: '%', max: 100, color: '#22c55e', Icon: HeartPulse, isGauge: true },
        { label: 'Water Level', value: mockData.waterTank, unit: '%', max: 100, color: '#0ea5e9', Icon: Droplets, isGauge: true },
        { label: 'Soil Moisture', value: mockData.moisture, unit: '%', max: 100, color: '#10b981', Icon: Activity, isGauge: true },
        { label: 'Temperature', value: mockData.temperature, unit: '°C', max: 50, color: '#f43f5e', Icon: ThermometerSun, isGauge: true },
        { label: 'Humidity', value: mockData.humidity, unit: '%', max: 100, color: '#a855f7', Icon: CloudRain, isGauge: true },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <MetricCard key={card.label} {...card} delay={i * 0.05} />
            ))}
        </div>
    );
};

export default DashboardCards;
