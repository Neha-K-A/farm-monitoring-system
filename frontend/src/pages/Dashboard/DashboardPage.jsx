import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../../components/Layout/MainLayout.jsx';
import DashboardCards from '../../components/DashboardCards.jsx';
import WeatherWidget from '../../components/WeatherWidget.jsx';
import FarmVisualization from '../../components/FarmVisualization.jsx';
import PredictionCards from '../../components/PredictionCards.jsx';
import CostChart from '../../components/CostChart.jsx';
import CropDetectionPanel from '../../components/CropDetectionPanel.jsx';
import CropGrowthProgress from '../../components/CropGrowthProgress.jsx';
import cropService from '../../services/cropService.js';
import dashboardService from '../../services/dashboardService.js';

const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-2 border-[#2ECC71] border-t-transparent rounded-full animate-spin" />
  </div>
);

const DashboardPage = () => {
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [costData, setCostData] = useState([]);
  const [iotData, setIotData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      await Promise.allSettled([
        cropService.getCrops()
          .then(d => setCrops(Array.isArray(d) ? d : []))
          .catch((err) => {
            console.error('[Dashboard] Failed to load crops:', err);
          }),
        dashboardService.getWeatherMock()
          .then(d => {
            setWeather(d?.current || d);
            setForecast(d?.forecast || []);
          })
          .catch((err) => {
            console.error('[Dashboard] Failed to load weather:', err);
          }),
        dashboardService.getPredictions()
          .then(d => setPredictions(Array.isArray(d) ? d : []))
          .catch((err) => {
            console.error('[Dashboard] Failed to load predictions:', err);
          }),
        dashboardService.getHarvestCost()
          .then(d => setCostData(Array.isArray(d) ? d : []))
          .catch((err) => {
            console.error('[Dashboard] Failed to load harvest cost:', err);
          }),
      ]);
    } catch (err) {
      console.error('[Dashboard] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout pageTitle="Dashboard">
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4 animate-fade-slide-up">
          {/* Section 1 — Production Summary Cards */}
          <DashboardCards crops={crops} />

          {/* Section 1.5 - Crop Growth Progress */}
          <div className="mt-4">
            <CropGrowthProgress />
          </div>

          {/* Section 2+3 — Weather + Farm Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <WeatherWidget weatherData={weather} forecast={forecast} />
            </div>
            <div className="lg:col-span-2">
              <FarmVisualization iotData={iotData} />
            </div>
          </div>

          {/* Section 4 — Predictive Analysis */}
          <PredictionCards predictions={predictions} />

          {/* Section 5+6 — Cost Chart + Crop Detection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CostChart costData={costData} />
            <CropDetectionPanel />
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default DashboardPage;
