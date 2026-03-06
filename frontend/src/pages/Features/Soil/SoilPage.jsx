import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Button from '../../../components/Common/Button.jsx';
import Input from '../../../components/Common/Input.jsx';
import Select from '../../../components/Common/Select.jsx';
import Textarea from '../../../components/Common/Textarea.jsx';
import Modal from '../../../components/Common/Modal.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import { useForm } from '../../../hooks/useForm.js';
import soilService from '../../../services/soilService.js';
import farmService from '../../../services/farmService.js';
import { SOIL_TYPES } from '../../../utils/constants.js';
import { Cloud, Plus, Trash2, Edit2, TrendingUp } from 'lucide-react';

const SoilPage = () => {
  const navigate = useNavigate();
  const [soilRecords, setSoilRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState('');
  const { success, error: notifyError } = useNotification();

  const { values, handleChange, reset } = useForm({
    pH: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    organicMatter: '',
    moisture: '',
    texture: '',
    testDate: '',
    labReportUrl: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const farmsData = await farmService.getFarms();
        setFarms(farmsData || []);
        if (farmsData && farmsData.length > 0) {
          const farmId = farmsData[0]._id;
          setSelectedFarm(farmId);
          const soilData = await soilService.getSoilRecords(farmId);
          setSoilRecords(soilData || []);
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

  const loadSoilRecords = async () => {
    try {
      setLoading(true);
      const data = await soilService.getSoilRecords(selectedFarm);
      setSoilRecords(data || []);
    } catch (err) {
      notifyError('Failed to load soil records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const recordData = {
        pH: parseFloat(values.pH),
        nitrogen: parseFloat(values.nitrogen),
        phosphorus: parseFloat(values.phosphorus),
        potassium: parseFloat(values.potassium),
        organicMatter: parseFloat(values.organicMatter),
        moisture: parseFloat(values.moisture),
        texture: values.texture,
        testDate: values.testDate,
        labReportUrl: values.labReportUrl,
      };

      if (editingRecord) {
        await soilService.updateSoilRecord(editingRecord._id, recordData);
        success('Soil record updated successfully!');
      } else {
        await soilService.createSoilRecord(selectedFarm, recordData);
        success('Soil record created successfully!');
      }

      setShowForm(false);
      setEditingRecord(null);
      reset();
      loadSoilRecords();
    } catch (err) {
      notifyError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this soil record?')) return;

    try {
      await soilService.deleteSoilRecord(recordId);
      success('Soil record deleted successfully!');
      loadSoilRecords();
    } catch (err) {
      notifyError('Failed to delete soil record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    Object.keys(record).forEach((key) => {
      if (key in values) {
        handleChange({ target: { name: key, value: record[key] } });
      }
    });
    setShowForm(true);
  };

  const getQualityScore = (record) => {
    let score = 0;
    if (record.pH >= 6 && record.pH <= 7.5) score += 20;
    if (record.nitrogen > 200) score += 20;
    if (record.phosphorus > 20) score += 20;
    if (record.potassium > 150) score += 20;
    if (record.organicMatter > 2) score += 20;
    return score;
  };

  if (loading && soilRecords.length === 0) return <Loader />;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
              <Cloud className="text-[#2ECC71]" size={32} />
              Lithospheric Analytics
            </h1>
            <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Territory soil quality tracking and chemical composition ledger.</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="!rounded-xl shadow-lg !px-6 !py-3 font-bold !bg-[#2ECC71]"
          >
            <Plus size={18} /> Add Analysis Record
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

        {/* Soil Records */}
        {soilRecords.length === 0 ? (
          <EmptyState title="No soil records" description="Add your first soil test record" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {soilRecords.map((record) => (
              <Card key={record._id} className="relative hover:shadow-2xl transition-all border-[#E0E0E0] !p-6 !bg-white overflow-hidden group">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-3 bg-[#F8F9FA] hover:bg-[#EAF9F1] hover:text-[#2ECC71] border border-[#E0E0E0] rounded-xl text-[#636E72] transition-all shadow-sm active:scale-90"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(record._id)}
                    className="p-3 bg-[#F8F9FA] hover:bg-[#FFF5F5] hover:text-[#E53E3E] hover:border-[#FED7D7] rounded-xl text-[#636E72] transition-all shadow-sm active:scale-90"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="pr-12">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em]">
                      {new Date(record.testDate).toLocaleDateString()}
                    </p>
                    <Badge className={`font-black !rounded-lg !px-3 border ${getQualityScore(record) > 60 ? '!bg-[#EAF9F1] !text-[#2ECC71] border-[#C3E6CB]' : '!bg-[#FFF9DB] !text-[#D69E2E] border-[#FAF089]'}`}>
                      INDEX: {getQualityScore(record)}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0]">
                      <p className="text-[#636E72] font-black uppercase tracking-tighter mb-1">pH Interaction</p>
                      <p className="text-lg font-black text-[#1A1A2E]">{record.pH.toFixed(1)}</p>
                    </div>
                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0]">
                      <p className="text-[#636E72] font-black uppercase tracking-tighter mb-1">Hydration Index</p>
                      <p className="text-lg font-black text-[#1A1A2E]">{record.moisture.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0]">
                      <p className="text-[#636E72] font-black uppercase tracking-tighter mb-1">Nitrogen (N)</p>
                      <p className="text-lg font-black text-[#1A1A2E]">{record.nitrogen} PPM</p>
                    </div>
                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0]">
                      <p className="text-[#636E72] font-black uppercase tracking-tighter mb-1">Organic Yield</p>
                      <p className="text-lg font-black text-[#1A1A2E]">{record.organicMatter.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F1F3F5] flex justify-between items-center">
                    <p className="text-[10px] font-black text-[#636E72] uppercase tracking-widest">Texture: {record.texture?.toUpperCase()}</p>
                    {record.labReportUrl && (
                      <a href={record.labReportUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-[#2ECC71] uppercase tracking-[0.2em] hover:underline flex items-center gap-1">
                        View Certificate <TrendingUp size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <Modal
            title={editingRecord ? 'Edit Soil Record' : 'Add Soil Record'}
            onClose={() => {
              setShowForm(false);
              setEditingRecord(null);
              reset();
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Test Date"
                type="date"
                name="testDate"
                value={values.testDate}
                onChange={handleChange}
                required
              />
              <Input
                label="pH Level"
                type="number"
                step="0.1"
                name="pH"
                value={values.pH}
                onChange={handleChange}
                placeholder="6.5"
                required
              />
              <Input
                label="Nitrogen (ppm)"
                type="number"
                name="nitrogen"
                value={values.nitrogen}
                onChange={handleChange}
                placeholder="240"
                required
              />
              <Input
                label="Phosphorus (ppm)"
                type="number"
                name="phosphorus"
                value={values.phosphorus}
                onChange={handleChange}
                placeholder="30"
                required
              />
              <Input
                label="Potassium (ppm)"
                type="number"
                name="potassium"
                value={values.potassium}
                onChange={handleChange}
                placeholder="180"
                required
              />
              <Input
                label="Organic Matter (%)"
                type="number"
                step="0.1"
                name="organicMatter"
                value={values.organicMatter}
                onChange={handleChange}
                placeholder="3.2"
                required
              />
              <Input
                label="Moisture (%)"
                type="number"
                step="0.1"
                name="moisture"
                value={values.moisture}
                onChange={handleChange}
                placeholder="20"
                required
              />
              <Select
                label="Soil Texture"
                name="texture"
                value={values.texture}
                onChange={handleChange}
                options={SOIL_TYPES}
                required
              />
              <Input
                label="Lab Report URL"
                type="url"
                name="labReportUrl"
                value={values.labReportUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
              <Button type="submit" className="w-full !rounded-xl !py-4 !bg-[#2ECC71] font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all mt-4">
                {editingRecord ? 'Commit Structural Update' : 'Initialize Analytical Entry'}
              </Button>
            </form>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

export default SoilPage;
