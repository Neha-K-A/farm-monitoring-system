import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, BarChart, Bar, Legend } from 'recharts';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import wsService from '../../../services/websocket.js';

// Gauge Chart component using Recharts Pie
const GaugeChart = ({ value, max, label, color }) => {
    const data = [
        { name: label, value: value },
        { name: 'Remaining', value: max - value }
    ];
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="h-32 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={45}
                            outerRadius={60}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={true}
                        >
                            <Cell fill={color} />
                            <Cell fill="#F1F8E9" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end pb-2">
                    <span className="text-2xl font-bold text-[#1A1A2E]">{value}</span>
                </div>
            </div>
            <span className="text-[10px] text-[#636E72] uppercase font-bold tracking-wider mt-2">{label}</span>
        </div>
    );
};

const SensorCard = ({ title, value, unit, max, color, history }) => (
    <motion.div
        className="card flex flex-col overflow-hidden !p-0 shadow-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="p-4 border-b border-[#E0E0E0] flex justify-between items-center bg-[#F8F9FA]">
            <h3 className="text-sm font-bold text-[#1A1A2E]">{title}</h3>
            <div className="flex items-center gap-1.5">
                <span className="live-dot" style={{ background: color, boxShadow: `0 0 10px ${color}40` }} />
                <span className="text-[10px] uppercase font-black text-[#636E72] tracking-widest">Live</span>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-2 divide-x divide-[#E0E0E0]">
            <GaugeChart value={value} max={max} label={unit} color={color} />
            <div className="p-4 flex items-center justify-center h-full">
                <ResponsiveContainer width="100%" height={90}>
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill={`url(#color${title})`} strokeWidth={2} isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </motion.div>
);

const SensorsPage = () => {
    const [mockData, setMockData] = useState({
        moisture: 63, temperature: 28, humidity: 45, phLevel: 6.5,
        lightIntensity: 800, waterTank: 72, cropHealth: 87
    });

    const [histories, setHistories] = useState({
        moisture: Array(10).fill({ value: 63 }),
        temperature: Array(10).fill({ value: 28 }),
        humidity: Array(10).fill({ value: 45 }),
        phLevel: Array(10).fill({ value: 6.5 }),
        lightIntensity: Array(10).fill({ value: 800 }),
        waterTank: Array(10).fill({ value: 72 }),
    });

    useEffect(() => {
        // Fallback local mock interval for independent testing if websocket is dead entirely
        const interval = setInterval(() => {
            const num = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
            const numFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

            const newData = {
                moisture: num(50, 75),
                temperature: num(20, 35),
                humidity: num(40, 85),
                phLevel: numFloat(6.0, 7.5),
                lightIntensity: num(400, 1000),
                waterTank: num(30, 100)
            };

            setMockData(prev => ({ ...prev, ...newData }));

            setHistories(prev => {
                const newHist = {};
                for (const key in newData) {
                    newHist[key] = [...prev[key].slice(1), { value: newData[key] }];
                }
                return newHist;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const sensors = [
        { id: 'moisture', title: 'Soil Moisture', max: 100, unit: '%', color: '#10b981' },
        { id: 'temperature', title: 'Temperature', max: 50, unit: '°C', color: '#f43f5e' },
        { id: 'humidity', title: 'Air Humidity', max: 100, unit: '%', color: '#a855f7' },
        { id: 'phLevel', title: 'pH Level', max: 14, unit: 'pH', color: '#eab308' },
        { id: 'lightIntensity', title: 'Light Intensity', max: 1200, unit: 'LUX', color: '#facc15' },
        { id: 'waterTank', title: 'Water Tank', max: 100, unit: '%', color: '#0ea5e9' }
    ];

    return (
        <MainLayout pageTitle="Live Sensors">
            <div className="grid grid-cols-1 md:grid-cols-2 card !bg-[#FFFFFF] p-6 gap-6">
                <div className="col-span-1 md:col-span-2 mb-4">
                    <h2 className="text-[#1A1A2E] text-2xl font-extrabold">IoT Sensor Intelligence</h2>
                    <p className="text-[#636E72] text-xs font-bold uppercase tracking-widest mt-1">Real-time telemetry updated every 3.0 seconds.</p>
                </div>

                {sensors.map((s, idx) => (
                    <SensorCard
                        key={s.id}
                        title={s.title}
                        value={mockData[s.id]}
                        unit={s.unit}
                        max={s.max}
                        color={s.color}
                        history={histories[s.id]}
                    />
                ))}
            </div>
        </MainLayout>
    );
};

export default SensorsPage;
