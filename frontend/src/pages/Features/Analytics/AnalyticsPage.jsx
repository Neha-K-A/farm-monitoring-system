import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import wsService from '../../../services/websocket.js';

const AnalyticsPage = () => {
    // Generate historical mock data once
    const generateHistorical = (points, ranges) => {
        return Array.from({ length: points }).map((_, i) => {
            const data = { name: `Day ${i + 1}` };
            ranges.forEach(r => {
                data[r.key] = Math.floor(Math.random() * (r.max - r.min + 1) + r.min);
            });
            return data;
        });
    };

    const [cropHealth] = useState(generateHistorical(30, [
        { key: 'health', min: 70, max: 98 },
        { key: 'yield_pred', min: 65, max: 80 }
    ]));

    const [climateTrends] = useState(generateHistorical(30, [
        { key: 'temp', min: 18, max: 35 },
        { key: 'moisture', min: 40, max: 80 }
    ]));

    const [irrigationUsage] = useState(generateHistorical(12, [
        { key: 'water_usage', min: 120, max: 400 },
        { key: 'cost', min: 200, max: 600 }
    ]));

    const ChartCard = ({ title, desc, children }) => (
        <motion.div
            className="card flex flex-col"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="mb-6">
                <h3 className="text-[#1A1A2E] text-lg font-bold">{title}</h3>
                <p className="text-[#636E72] text-xs font-medium">{desc}</p>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
                {children}
            </div>
        </motion.div>
    );

    return (
        <MainLayout pageTitle="Advanced Analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">

                <ChartCard title="Crop Health Over Time" desc="30-day index comparing actual health to predicted yield baseline.">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cropHealth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                            <XAxis dataKey="name" stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1A1A2E' }} />
                            <Area type="monotone" dataKey="health" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" name="Health Index %" />
                            <Line type="monotone" dataKey="yield_pred" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted Yield" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Climate Trends" desc="30-day temperature variations against soil moisture retention.">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={climateTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                            <XAxis dataKey="name" stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1A1A2E' }} />
                            <Line yAxisId="left" type="smooth" dataKey="moisture" stroke="#0ea5e9" strokeWidth={3} dot={false} name="Soil Moisture %" />
                            <Line yAxisId="right" type="step" dataKey="temp" stroke="#f43f5e" strokeWidth={2} dot={false} name="Temp °C" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Irrigation Usage & Cost" desc="Monthly aggregate of water usage correlated with estimated operating cost.">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={irrigationUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                            <XAxis dataKey="name" stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#636E72" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} cursor={{ fill: '#F8F9FA' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1A1A2E' }} />
                            <Bar yAxisId="left" dataKey="water_usage" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Water Used (KL)" />
                            <Bar yAxisId="right" dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Cost Est. ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

            </div>
        </MainLayout>
    );
};

export default AnalyticsPage;
