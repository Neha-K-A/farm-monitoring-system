import { useEffect, useState } from 'react';
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
import farmService from '../../../services/farmService.js';
import { AREA_UNITS } from '../../../utils/constants.js';
import { Plus, Trash2, Edit2, Leaf } from 'lucide-react';

const FarmListPage = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const { success, error: notifyError } = useNotification();

  const { values, handleChange, reset } = useForm({
    farmName: editingFarm?.farmName || '',
    totalArea: editingFarm?.totalArea || '',
    areaUnit: editingFarm?.areaUnit || 'acres',
    soilType: editingFarm?.soilType || '',
    district: editingFarm?.location?.district || '',
    state: editingFarm?.location?.state || '',
    irrigationSystem: editingFarm?.irrigationSystem || '',
    waterSource: editingFarm?.waterSource || '',
    notes: editingFarm?.notes || '',
  });

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const data = await farmService.getFarms();
      setFarms(data || []);
    } catch (err) {
      notifyError('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const farmData = {
        farmName: values.farmName,
        totalArea: parseFloat(values.totalArea),
        areaUnit: values.areaUnit,
        soilType: values.soilType,
        location: {
          district: values.district,
          state: values.state,
        },
      };
      if (values.irrigationSystem) farmData.irrigationSystem = values.irrigationSystem;
      if (values.waterSource) farmData.waterSource = values.waterSource;
      if (values.notes) farmData.notes = values.notes;

      if (editingFarm) {
        await farmService.updateFarm(editingFarm._id, farmData);
        success('Farm updated successfully!');
      } else {
        await farmService.createFarm(farmData);
        success('Farm created successfully!');
      }

      setShowForm(false);
      setEditingFarm(null);
      reset();
      loadFarms();
    } catch (err) {
      notifyError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) return;

    try {
      await farmService.deleteFarm(farmId);
      success('Farm deleted successfully!');
      loadFarms();
    } catch (err) {
      notifyError('Failed to delete farm');
    }
  };

  const handleEdit = (farm) => {
    setEditingFarm(farm);
    setShowForm(true);
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Farms" activeFeature="farm">
        <Loader />
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="Farms" activeFeature="farm">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1A2E]">Pro Farm Registry</h2>
          <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Manage your land assets and agricultural territories.</p>
        </div>
        <Button
          variant="primary"
          className="!rounded-xl shadow-lg !px-6 !py-3 font-bold !bg-[#2ECC71]"
          onClick={() => {
            setEditingFarm(null);
            setShowForm(true);
            reset();
          }}
        >
          <Plus size={18} />
          Register Farm
        </Button>
      </div>

      {farms.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No Farms Yet"
          description="Start by creating your first farm"
          action={
            <Button
              variant="primary"
              onClick={() => {
                setEditingFarm(null);
                setShowForm(true);
              }}
            >
              Create Your First Farm
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <Card key={farm._id} className="hover:shadow-2xl transition-all !p-6 border-[#E0E0E0]">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-extrabold text-[#1A1A2E] tracking-tight">
                  {farm.farmName}
                </h3>
                <Badge className="!bg-[#EAF9F1] !text-[#2ECC71] border border-[#C3E6CB] font-black !rounded-lg !px-3">{farm.totalArea} {farm.areaUnit}</Badge>
              </div>

              <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-widest mb-4">
                📍 {farm.location?.district}, {farm.location?.state}
              </p>

              <div className="space-y-3 mb-6 p-4 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0]">
                <p className="flex justify-between text-xs">
                  <span className="font-bold text-[#636E72] uppercase tracking-tighter">Soil Composition</span>
                  <span className="font-extrabold text-[#1A1A2E]">{farm.soilType || 'N/A'}</span>
                </p>
                {farm.irrigationSystem && (
                  <p className="flex justify-between text-xs">
                    <span className="font-bold text-[#636E72] uppercase tracking-tighter">Irrigation System</span>
                    <span className="font-extrabold text-[#1A1A2E]">{farm.irrigationSystem}</span>
                  </p>
                )}
                {farm.waterSource && (
                  <p className="flex justify-between text-xs">
                    <span className="font-bold text-[#636E72] uppercase tracking-tighter">Water Source</span>
                    <span className="font-extrabold text-[#1A1A2E]">{farm.waterSource}</span>
                  </p>
                )}
              </div>

              {farm.notes && (
                <p className="text-xs text-[#636E72] italic mb-6 p-3 bg-white border-l-4 border-[#2ECC71] rounded shadow-sm leading-relaxed">
                  "{farm.notes}"
                </p>
              )}

              <div className="flex gap-4 pt-4 border-t border-[#E0E0E0]">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 !bg-[#F8F9FA] !text-[#1A1A2E] font-bold !rounded-xl border border-[#E0E0E0] hover:!bg-[#E0E0E0]"
                  onClick={() => handleEdit(farm)}
                >
                  <Edit2 size={14} />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 !bg-[#FFF5F5] !text-[#E53E3E] font-bold !rounded-xl border border-[#FED7D7] hover:!bg-[#FED7D7]"
                  onClick={() => handleDelete(farm._id)}
                >
                  <Trash2 size={14} />
                  Archive
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingFarm(null);
          reset();
        }}
        title={editingFarm ? 'Edit Farm' : 'Create New Farm'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Farm Name"
            name="farmName"
            value={values.farmName}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Area"
              name="totalArea"
              type="number"
              value={values.totalArea}
              onChange={handleChange}
              step="0.01"
              required
            />
            <Select
              label="Unit"
              name="areaUnit"
              value={values.areaUnit}
              onChange={handleChange}
              options={AREA_UNITS.map((unit) => ({
                value: unit,
                label: unit,
              }))}
            />
          </div>

          <Input
            label="Soil Type"
            name="soilType"
            value={values.soilType}
            onChange={handleChange}
            placeholder="e.g., clay, sandy, loamy, silty, peaty, chalky"
          />

          <Input
            label="District"
            name="district"
            value={values.district}
            onChange={handleChange}
            placeholder="Enter district name"
          />

          <Input
            label="State"
            name="state"
            value={values.state}
            onChange={handleChange}
            required
          />

          <Select
            label="Irrigation System (Optional)"
            name="irrigationSystem"
            value={values.irrigationSystem}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select irrigation system' },
              { value: 'drip', label: 'Drip Irrigation' },
              { value: 'sprinkler', label: 'Sprinkler' },
              { value: 'flood', label: 'Flood' },
              { value: 'rainfed', label: 'Rainfed' },
              { value: 'mixed', label: 'Mixed' },
              { value: 'none', label: 'None' }
            ]}
          />

          <Select
            label="Water Source (Optional)"
            name="waterSource"
            value={values.waterSource}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select water source' },
              { value: 'well', label: 'Well' },
              { value: 'borewell', label: 'Borewell' },
              { value: 'canal', label: 'Canal' },
              { value: 'river', label: 'River' },
              { value: 'rainwater', label: 'Rainwater' },
              { value: 'mixed', label: 'Mixed' }
            ]}
          />

          <Textarea
            label="Notes"
            name="notes"
            value={values.notes}
            onChange={handleChange}
            rows={3}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {editingFarm ? 'Update Farm' : 'Create Farm'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowForm(false);
                setEditingFarm(null);
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

export default FarmListPage;
