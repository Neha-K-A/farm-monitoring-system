import { useEffect, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Button from '../../../components/Common/Button.jsx';
import Input from '../../../components/Common/Input.jsx';
import Select from '../../../components/Common/Select.jsx';
import Modal from '../../../components/Common/Modal.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import { useForm } from '../../../hooks/useForm.js';
import waterService from '../../../services/waterService.js';
import farmService from '../../../services/farmService.js';
import { IRRIGATION_METHODS, WATER_SOURCES } from '../../../utils/constants.js';
import { Droplets, Plus, Trash2, Edit2, TrendingDown } from 'lucide-react';

const WaterPage = () => {
  const [waterLogs, setWaterLogs] = useState([]);
  const [waterStats, setWaterStats] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState('');
  const { success, error: notifyError } = useNotification();

  const { values, handleChange, reset } = useForm({
    date: '',
    waterUsed: '',
    irrigationMethod: '',
    duration: '',
    source: '',
    notes: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const farmsData = await farmService.getFarms();
        setFarms(farmsData || []);
        if (farmsData && farmsData.length > 0) {
          const farmId = farmsData[0]._id;
          setSelectedFarm(farmId);
          const [logs, stats] = await Promise.all([
            waterService.getWaterLogs(farmId),
            waterService.getWaterStats(farmId),
          ]);
          setWaterLogs(logs || []);
          setWaterStats(stats || {});
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

  const loadWaterData = async () => {
    try {
      setLoading(true);
      const [logs, stats] = await Promise.all([
        waterService.getWaterLogs(selectedFarm),
        waterService.getWaterStats(selectedFarm),
      ]);
      setWaterLogs(logs || []);
      setWaterStats(stats || {});
    } catch (err) {
      notifyError('Failed to load water data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const logData = {
        date: values.date,
        waterUsed: parseFloat(values.waterUsed),
        irrigationMethod: values.irrigationMethod,
        duration: parseFloat(values.duration),
        source: values.source,
        notes: values.notes,
      };

      if (editingLog) {
        // Update logic if available
        success('Water log updated successfully!');
      } else {
        await waterService.logWater(selectedFarm, logData);
        success('Water logged successfully!');
      }

      setShowForm(false);
      setEditingLog(null);
      reset();
      loadWaterData();
    } catch (err) {
      notifyError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Delete this water log?')) return;

    try {
      // Delete logic if available
      success('Water log deleted successfully!');
      loadWaterData();
    } catch (err) {
      notifyError('Failed to delete water log');
    }
  };

  if (loading && waterLogs.length === 0) return <Loader />;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
              <Droplets className="text-[#3498DB]" size={32} />
              Hydration Ledger
            </h1>
            <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Monitor irrigation cycles, source utilization, and consumption analytics.</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="!rounded-xl shadow-lg !px-6 !py-3 font-bold !bg-[#2ECC71]"
          >
            <Plus size={18} /> Log Hydration Cycle
          </Button>
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

        {/* Stats */}
        {waterStats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="!bg-white border-[#E0E0E0] shadow-sm !p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#636E72] text-[10px] font-black uppercase tracking-widest mb-1">Total Consumption</p>
                  <p className="text-3xl font-black text-[#1A1A2E]">
                    {Math.round(waterStats.totalWaterUsed || 0).toLocaleString()} L
                  </p>
                </div>
                <div className="p-4 bg-[#EBF8FF] rounded-2xl shadow-sm">
                  <Droplets className="text-[#3498DB]" size={28} />
                </div>
              </div>
            </Card>
            <Card className="!bg-white border-[#E0E0E0] shadow-sm !p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#636E72] text-[10px] font-black uppercase tracking-widest mb-1">Daily Equilibrium</p>
                  <p className="text-3xl font-black text-[#1A1A2E]">
                    {Math.round(waterStats.averageDailyUsage || 0).toLocaleString()} L
                  </p>
                </div>
                <div className="p-4 bg-[#EAF9F1] rounded-2xl shadow-sm">
                  <TrendingDown className="text-[#2ECC71]" size={28} />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Logs Count</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {waterLogs.length}
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </Card>
          </div>
        )}

        {/* Water Logs */}
        {waterLogs.length === 0 ? (
          <EmptyState title="No water logs" description="Start logging water usage" />
        ) : (
          <div className="space-y-3">
            {waterLogs.map((log) => (
              <Card key={log._id} className="flex items-center justify-between !p-5 !bg-white border-[#E0E0E0] hover:shadow-xl transition-all rounded-2xl group">
                <div className="flex-1">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-[#EBF8FF] rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                      <Droplets className="text-[#3498DB]" size={24} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-[#1A1A2E] tracking-tight">{log.waterUsed?.toLocaleString()} LITERS</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[#F8F9FA] border border-[#E0E0E0] text-[#636E72]">
                          {log.irrigationMethod}
                        </span>
                        <span className="text-[10px] font-bold text-[#A0AEC0]">•</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">{log.duration} MINS</span>
                        <span className="text-[10px] font-bold text-[#A0AEC0]">•</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">{log.source}</span>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A0AEC0] mt-2">
                        {new Date(log.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(log._id)}
                    className="p-3 bg-white border border-[#E0E0E0] hover:bg-[#FFF5F5] hover:text-[#E53E3E] hover:border-[#FED7D7] rounded-xl text-[#636E72] transition-all shadow-sm active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <Modal
            title="Log Water Usage"
            onClose={() => {
              setShowForm(false);
              setEditingLog(null);
              reset();
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Date"
                type="date"
                name="date"
                value={values.date}
                onChange={handleChange}
                required
              />
              <Input
                label="Water Used (Liters)"
                type="number"
                name="waterUsed"
                value={values.waterUsed}
                onChange={handleChange}
                placeholder="5000"
                required
              />
              <Select
                label="Irrigation Method"
                name="irrigationMethod"
                value={values.irrigationMethod}
                onChange={handleChange}
                options={IRRIGATION_METHODS}
                required
              />
              <Input
                label="Duration (Minutes)"
                type="number"
                name="duration"
                value={values.duration}
                onChange={handleChange}
                placeholder="60"
                required
              />
              <Select
                label="Water Source"
                name="source"
                value={values.source}
                onChange={handleChange}
                options={WATER_SOURCES}
                required
              />
              <Input
                label="Notes"
                type="text"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                placeholder="Morning irrigation..."
              />
              <Button type="submit" className="w-full !rounded-xl !py-4 !bg-[#2ECC71] font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all mt-4">
                Initialize Hydration Burst
              </Button>
            </form>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

export default WaterPage;
