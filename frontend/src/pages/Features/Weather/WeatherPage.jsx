import { useEffect, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import Select from '../../../components/Common/Select.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import weatherService from '../../../services/weatherService.js';
import farmService from '../../../services/farmService.js';
import { Cloud, CloudRain, Wind, Droplets, Sun, AlertTriangle } from 'lucide-react';

const WeatherPage = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState('');
  const { error: notifyError } = useNotification();

  useEffect(() => {
    const init = async () => {
      try {
        const farmsData = await farmService.getFarms();
        setFarms(farmsData || []);
        if (farmsData && farmsData.length > 0) {
          const farmId = farmsData[0]._id;
          setSelectedFarm(farmId);
          const [current, forecastData] = await Promise.all([
            weatherService.getCurrentWeather(farmId),
            weatherService.getWeatherForecast(farmId),
          ]);
          setWeather(current || {});
          setForecast(forecastData?.forecast || []);
        }
      } catch (err) {
        notifyError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadFarms = async () => {
    try {
      const data = await farmService.getFarms();
      setFarms(data || []);
      if (data && data.length > 0) {
        setSelectedFarm(data[0]._id);
      }
    } catch (err) {
      notifyError('Failed to load farms');
    }
  };

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const [current, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(selectedFarm),
        weatherService.getWeatherForecast(selectedFarm),
      ]);
      setWeather(current || {});
      setForecast(forecastData?.forecast || []);
    } catch (err) {
      notifyError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    if (!condition) return null;
    const cond = condition.toLowerCase();
    if (cond.includes('rain')) return <CloudRain className="text-blue-600" size={32} />;
    if (cond.includes('cloud')) return <Cloud className="text-gray-600" size={32} />;
    if (cond.includes('sunny') || cond.includes('clear')) return <Sun className="text-yellow-500" size={32} />;
    return <Cloud className="text-muted" size={32} />;
  };

  if (loading && !weather) return <Loader />;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
            <Sun className="text-[#F1C40F]" size={32} />
            Atmospheric Intelligence
          </h1>
          <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Real-time meteorological monitoring and hyper-local agricultural forecasts.</p>
        </div>

        {/* Farm Selector */}
        <Card className="!bg-white border-[#E0E0E0] shadow-sm !p-6">
          <Select
            label="SELECT TARGET LAND ASSET"
            labelClassName="text-[10px] font-black uppercase tracking-widest text-[#636E72] mb-2"
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="!bg-[#F8F9FA] border-[#E0E0E0] text-[#1A1A2E] font-bold rounded-xl"
            options={farms.map((farm) => ({
              value: farm._id,
              label: farm.name.toUpperCase(),
            }))}
          />
        </Card>

        {/* Current Weather */}
        <Card className="!bg-white border-[#E0E0E0] shadow-2xl !p-8 rounded-[2rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EBF8FF] opacity-20 -mr-32 -mt-32 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <p className="text-[#636E72] text-[10px] font-black uppercase tracking-[0.2em] mb-3">Live Meteorological Stream</p>
              <h2 className="text-6xl font-black text-[#1A1A2E] tracking-tighter">{weather.temperature}°C</h2>
              <Badge className="!bg-[#EAF9F1] !text-[#2ECC71] border border-[#C3E6CB] font-black !rounded-lg !px-4 !py-1.5 mt-4 uppercase tracking-widest text-xs">
                {weather.condition}
              </Badge>
            </div>
            <div className="bg-[#F8F9FA] p-6 rounded-[2.5rem] shadow-inner border border-[#E0E0E0]">
              {getWeatherIcon(weather.condition)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 relative z-10">
            <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 text-[#636E72] mb-3">
                <Droplets size={18} className="text-[#3498DB]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Humidity</span>
              </div>
              <p className="text-3xl font-black text-[#1A1A2E]">{weather.humidity}%</p>
            </div>
            <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 text-[#636E72] mb-3">
                <Wind size={18} className="text-[#2ECC71]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Wind Velocity</span>
              </div>
              <p className="text-3xl font-black text-[#1A1A2E]">{weather.windSpeed} <span className="text-sm">KM/H</span></p>
            </div>
            <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 text-[#636E72] mb-3">
                <Sun size={18} className="text-[#F1C40F]" />
                <span className="text-[10px] font-black uppercase tracking-widest">UV Index</span>
              </div>
              <p className="text-3xl font-black text-[#1A1A2E]">{weather.uvIndex}</p>
            </div>
          </div>

          {/* Alerts */}
          {weather.alerts && weather.alerts.length > 0 && (
            <div className="mt-8 p-6 bg-[#FFF9DB] border border-[#FAF089] rounded-2xl relative z-10">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <AlertTriangle className="text-[#E67E22]" size={20} />
                </div>
                <div>
                  <p className="font-black text-[#856404] uppercase tracking-widest text-xs mb-3">Protocol Violations / Alerts</p>
                  <div className="space-y-2">
                    {weather.alerts.map((alert, idx) => (
                      <p key={idx} className="text-sm text-[#856404] font-bold flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#E67E22]"></span>
                        {alert}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {weather.plantingRecommendation && (
            <div className="mt-4 p-6 bg-[#EAF9F1] border border-[#C3E6CB] rounded-2xl flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Badge className="!bg-[#2ECC71] w-2 h-2 !p-0 rounded-full animate-pulse"></Badge>
              </div>
              <p className="text-sm text-[#155724] font-bold">
                <span className="font-black uppercase tracking-widest mr-2">Advisory:</span>
                {weather.plantingRecommendation}
              </p>
            </div>
          )}
        </Card>
        {/* Spacer */}
        <div className="h-6"></div>
        <div className="mt-12">
          <h3 className="text-xl font-black text-[#1A1A2E] mb-6 uppercase tracking-widest flex items-center gap-3">
            <span className="w-8 h-px bg-[#E0E0E0]"></span>
            Synchronized 5-Day Projection
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {forecast.map((day, idx) => (
              <Card key={idx} className="!p-6 text-center hover:shadow-xl transition-all border-[#E0E0E0] !bg-white group overflow-hidden">
                <p className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] mb-4 group-hover:text-[#2ECC71] transition-colors">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <div className="flex justify-center mb-6 bg-[#F8F9FA] p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                  {getWeatherIcon(day.condition)}
                </div>
                <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest mb-6">{day.condition}</p>
                <div className="space-y-4 pt-4 border-t border-[#F1F3F5]">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-[#A0AEC0] uppercase">High</span>
                    <span className="text-sm font-black text-[#1A1A2E]">{Math.round(day.maxTemp)}°C</span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-[#A0AEC0] uppercase">Low</span>
                    <span className="text-sm font-black text-[#1A1A2E]">{Math.round(day.minTemp)}°C</span>
                  </div>
                  <div className="pt-4 border-t border-[#F1F3F5]">
                    <Badge className={`font-black !rounded-lg !px-3 border text-[10px] ${day.rainChance > 50 ? '!bg-[#FFF5F5] !text-[#E53E3E] border-[#FED7D7]' : '!bg-[#EAF9F1] !text-[#2ECC71] border-[#C3E6CB]'}`}>
                      RAIN: {day.rainChance}%
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {forecast.length === 0 && (
          <EmptyState title="No forecast available" description="Weather forecast will be displayed here" />
        )}
      </div>
    </MainLayout>
  );
};

export default WeatherPage;
