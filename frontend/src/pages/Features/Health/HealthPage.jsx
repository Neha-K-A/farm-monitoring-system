import { useEffect, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Button from '../../../components/Common/Button.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import { formatDate, formatNumber } from '../../../utils/formatters.js';
import { useNotification } from '../../../hooks/useNotification.js';
import healthService from '../../../services/healthService.js';
import { Heart, Plus } from 'lucide-react';
import Modal from '../../../components/Common/Modal.jsx';
import Input from '../../../components/Common/Input.jsx';
import Textarea from '../../../components/Common/Textarea.jsx';
import Select from '../../../components/Common/Select.jsx';
import { useForm } from '../../../hooks/useForm.js';
import { HEALTH_MOODS } from '../../../utils/constants.js';

const HealthPage = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { success, error: notifyError } = useNotification();

  const { values, handleChange, reset, handleSubmit: onSubmit } = useForm(
    {
      workHours: '',
      mood: '',
      waterIntake: '',
      heatExposure: '',
      notes: '',
    },
    async (formValues) => {
      try {
        await healthService.logHealth({
          workHours: parseInt(formValues.workHours),
          mood: formValues.mood,
          waterIntake: parseFloat(formValues.waterIntake),
          heatExposure: parseInt(formValues.heatExposure),
          notes: formValues.notes,
        });
        success('Health logged successfully!');
        setShowForm(false);
        reset();
        loadData();
      } catch (err) {
        notifyError('Failed to log health');
      }
    }
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, summaryData, tipsData] = await Promise.all([
        healthService.getHealthLogs(),
        healthService.getHealthSummary(),
        healthService.getHealthTips(),
      ]);
      setLogs(logsData || []);
      setSummary(summaryData);
      setTips(tipsData || []);
    } catch (err) {
      notifyError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit();
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Health & Wellness" activeFeature="health">
        <Loader />
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="Health & Wellness" activeFeature="health">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1A2E]">Health Tracking</h2>
          <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Monitor your daily wellness and farm activity logs.</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)} className="!rounded-xl shadow-lg !px-6 !py-3 font-bold !bg-[#2ECC71]">
          <Plus size={18} />
          Log Health
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-wider mb-2">
              Avg Work Hours
            </p>
            <p className="text-3xl font-extrabold text-[#2ECC71]">
              {formatNumber(summary.averageWorkHours)}<span className="text-sm ml-1 text-[#636E72]">hrs</span>
            </p>
          </Card>

          <Card>
            <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-wider mb-2">
              Most Common Mood
            </p>
            <p className="text-3xl font-extrabold text-[#9B59B6] capitalize">
              {summary.moodDistribution?.[0]?.mood || 'Happy'}
            </p>
          </Card>

          <Card>
            <p className="text-[#636E72] text-[10px] font-bold uppercase tracking-wider mb-2">
              Total Logs
            </p>
            <p className="text-3xl font-extrabold text-[#3498DB]">{logs.length}</p>
          </Card>
        </div>
      )}

      {/* Health Tips */}
      {tips && tips.length > 0 && (
        <Card className="mb-10 border-l-4 border-[#2ECC71] !bg-[#F8F9FA]">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-6 uppercase tracking-tight">
            Personalized Health Tips
          </h3>
          <ul className="space-y-3">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-[#2ECC71] font-black mt-0.5">✓</span>
                <span className="text-[#636E72] font-medium text-sm leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Health Logs */}
      {logs.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Health Logs"
          description="Start tracking your health by logging your daily activity"
          action={
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Log Your First Health Entry
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log._id} className="hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-2">
                    {formatDate(log.createdAt)}
                  </p>
                  <Badge variant="primary" className="!rounded-lg !px-3 font-bold !bg-[#EAF9F1] !text-[#2ECC71] border border-[#C3E6CB]">
                    {log.mood?.toUpperCase() || 'HAPPY'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-6 pb-6 border-b border-[#E0E0E0]">
                <div>
                  <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-widest mb-1.5">Work Hours</p>
                  <p className="text-xl font-extrabold text-[#1A1A2E]">
                    {log.workHours}h
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-widest mb-1.5">Heat Exposure</p>
                  <p className="text-xl font-extrabold text-[#1A1A2E]">
                    {log.heatExposure}m
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-widest mb-1.5">Water Intake</p>
                  <p className="text-xl font-extrabold text-[#1A1A2E]">
                    {log.waterIntake}L
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-widest mb-1.5">Mood</p>
                  <p className="text-xl font-extrabold text-[#1A1A2E] capitalize">
                    {log.mood}
                  </p>
                </div>
              </div>

              {log.alerts && log.alerts.length > 0 && (
                <div className="bg-[#FFF5F5] border border-[#FEB2B2] rounded-xl p-4 mt-4">
                  <p className="text-xs font-bold text-[#C53030] mb-2 uppercase tracking-wider">
                    ⚠️ System Alerts Detected:
                  </p>
                  <ul className="space-y-1">
                    {log.alerts.map((alert, idx) => (
                      <li key={idx} className="text-sm font-bold text-[#C53030]">
                        • {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {log.notes && (
                <p className="text-sm text-[#636E72] font-medium italic mt-4 bg-[#F8F9FA] p-3 rounded-lg border-l-4 border-[#E0E0E0]">
                  "{log.notes}"
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Log Health Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Log Health Entry"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Work Hours"
            name="workHours"
            type="number"
            value={values.workHours}
            onChange={handleChange}
            required
          />

          <Input
            label="Heat Exposure (minutes)"
            name="heatExposure"
            type="number"
            value={values.heatExposure}
            onChange={handleChange}
            required
          />

          <Input
            label="Water Intake (liters)"
            name="waterIntake"
            type="number"
            step="0.1"
            value={values.waterIntake}
            onChange={handleChange}
            required
          />

          <Select
            label="Mood"
            name="mood"
            value={values.mood}
            onChange={handleChange}
            options={HEALTH_MOODS.map((mood) => ({
              value: mood,
              label: mood.charAt(0).toUpperCase() + mood.slice(1),
            }))}
            required
          />

          <Textarea
            label="Notes"
            name="notes"
            value={values.notes}
            onChange={handleChange}
            rows={3}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Log Health
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowForm(false);
                reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};

export default HealthPage;
