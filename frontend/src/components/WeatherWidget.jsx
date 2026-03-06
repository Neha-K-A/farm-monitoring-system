import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, Eye } from 'lucide-react';

const weatherIcons = {
    Clear: Sun, Sunny: Sun, Cloudy: Cloud, Overcast: Cloud,
    Rainy: CloudRain, Rain: CloudRain, Snowy: CloudSnow,
    'Partly Cloudy': Cloud, default: Cloud,
};

const WeatherIcon = ({ condition, size = 24, className = '' }) => {
    const Icon = weatherIcons[condition] || weatherIcons.default;
    return <Icon size={size} className={className} />;
};

const conditionColor = (c) => {
    if (!c) return '#9ca3af';
    if (c.includes('Rain')) return '#38bdf8';
    if (c.includes('Sun') || c === 'Clear') return '#f59e0b';
    if (c.includes('Snow')) return '#e0f2fe';
    return '#94a3b8';
};

import dashboardService from '../services/dashboardService.js';

const WeatherWidget = ({ weatherData = null, forecast = [] }) => {
    const [data, setData] = useState(null);
    const [fc, setFc] = useState([]);

    useEffect(() => {
        // Initial setup
        if (weatherData) setData(weatherData);
        if (forecast.length > 0) setFc(forecast);

        // Polling every 5s for live IoT-like data
        const interval = setInterval(async () => {
            try {
                const res = await dashboardService.getWeatherMock();
                if (res && res.current) {
                    setData(res.current);
                }
                if (res && res.forecast) {
                    setFc(res.forecast);
                }
            } catch (err) {
                console.error("Live weather polling failed:", err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [weatherData, forecast]);

    if (!data) return null;

    const iconColor = conditionColor(data.condition);

    return (
        <motion.div
            className="card flex flex-col gap-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[#1A1A2E] text-[10px] font-black uppercase tracking-[0.3em]">METEOROLOGICAL TELEMETRY</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#F1F3F5] text-[#2ECC71] text-[9px] font-black shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] shadow-[0_0_8px_#2ECC71] animate-pulse" />
                    REAL-TIME
                </div>
            </div>

            {/* Current weather */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-end gap-1">
                        <span className="text-[#1A1A2E] text-6xl font-black tracking-tighter">{Math.round(data.temperature)}</span>
                        <span className="text-[#A0AEC0] text-2xl mb-2 font-black">°C</span>
                    </div>
                    <p className="text-[#2ECC71] text-[10px] font-black uppercase tracking-[0.2em]">{data.condition}</p>
                    <p className="text-[#636E72] text-[10px] mt-1 font-bold uppercase tracking-tight opacity-60">Thermal Index {Math.round(data.feelsLike || data.temperature)}°C</p>
                </div>
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}30` }}
                >
                    <WeatherIcon condition={data.condition} size={32} className="" style={{ color: iconColor }} />
                </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { icon: Droplets, label: 'Humidity', value: `${data.humidity}%`, color: '#00695C', bg: '#E0F2F1' }, // mint
                    { icon: Wind, label: 'Wind', value: `${data.windSpeed} km/h`, color: '#33691E', bg: '#F1F8E9' }, // pale green
                    { icon: Eye, label: 'UV Index', value: data.uvIndex, color: '#E65100', bg: '#FFF3E0' },
                ].map(stat => (
                    <div key={stat.label}
                        className="flex flex-col items-center p-4 rounded-[1.25rem] gap-2 border border-[#F1F3F5] hover:border-[#2ECC71]/30 transition-all bg-white shadow-sm"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F8F9FA] text-[#1A1A2E]">
                            <stat.icon size={16} style={{ color: stat.color }} />
                        </div>
                        <span className="text-[#1A1A2E] font-black text-sm tracking-tight">{stat.value}</span>
                        <span className="text-[#636E72] text-[8px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Forecast strip */}
            {fc.length > 0 && (
                <div>
                    <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-wider mb-2.5">4-Day Forecast</p>
                    <div className="grid grid-cols-4 gap-2">
                        {fc.slice(0, 4).map((day, i) => {
                            const d = new Date(day.date);
                            const dayName = d.toLocaleDateString('en', { weekday: 'short' });
                            const dc = conditionColor(day.condition);
                            return (
                                <div key={i}
                                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#F8F9FA] border border-[#E0E0E0]"
                                >
                                    <span className="text-[#636E72] text-[10px] font-bold">{dayName}</span>
                                    <WeatherIcon condition={day.condition} size={16} style={{ color: dc }} />
                                    <span className="text-[#1A1A2E] text-xs font-bold">{Math.round(day.maxTemp)}°</span>
                                    <span className="text-[#636E72] text-[10px] font-bold">{day.rainChance}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recommendation */}
            {data.plantingRecommendation && (
                <div
                    className="px-3 py-2 rounded-xl text-xs text-[#27AE60] font-bold border border-[#C3E6CB]"
                    style={{ background: '#EAF9F1' }}
                >
                    💡 {data.plantingRecommendation}
                </div>
            )}
        </motion.div>
    );
};

export default WeatherWidget;
