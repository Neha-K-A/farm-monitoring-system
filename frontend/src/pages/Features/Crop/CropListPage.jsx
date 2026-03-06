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
import cropService from '../../../services/cropService.js';
import farmService from '../../../services/farmService.js';
import { CROP_TYPES, CROP_STAGES } from '../../../utils/constants.js';
import { formatDate, formatNumber, formatCurrency } from '../../../utils/formatters.js';
import { Plus, Trash2, Edit2, Leaf } from 'lucide-react';

const CropListPage = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const { success, error: notifyError } = useNotification();

  const { values, handleChange, reset } = useForm({
    cropName: editingCrop?.cropName || '',
    cropType: editingCrop?.cropType || '',
    farm: editingCrop?.farm || '',
    plantingDate: editingCrop?.plantingDate || '',
    expectedHarvestDate: editingCrop?.expectedHarvestDate || '',
    status: editingCrop?.status || 'planted',
    areaPlanted: editingCrop?.areaPlanted || '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cropsData, farmsData] = await Promise.all([
        cropService.getCrops(),
        farmService.getFarms(),
      ]);
      setCrops(cropsData || []);
      setFarms(farmsData || []);
    } catch (err) {
      notifyError('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cropData = {
        cropName: values.cropName,
        cropType: values.cropType,
        farm: values.farm,
        plantingDate: new Date(values.plantingDate),
        expectedHarvestDate: values.expectedHarvestDate
          ? new Date(values.expectedHarvestDate)
          : null,
        status: values.status,
        areaPlanted: parseFloat(values.areaPlanted),
      };

      if (editingCrop) {
        await cropService.updateCrop(editingCrop._id, cropData);
        success('Crop updated successfully!');
      } else {
        await cropService.createCrop(cropData);
        success('Crop created successfully!');
      }

      setShowForm(false);
      setEditingCrop(null);
      reset();
      loadData();
    } catch (err) {
      notifyError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return;

    try {
      await cropService.deleteCrop(cropId);
      success('Crop deleted successfully!');
      loadData();
    } catch (err) {
      notifyError('Failed to delete crop');
    }
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Crops" activeFeature="crop">
        <Loader />
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="Crops" activeFeature="crop">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1A2E]">Botanical Assets</h2>
          <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Monitor growth cycles, harvest windows, and plant health.</p>
        </div>
        <Button
          variant="primary"
          className="!rounded-xl shadow-lg !px-6 !py-3 font-bold !bg-[#2ECC71]"
          onClick={() => {
            setEditingCrop(null);
            setShowForm(true);
            reset();
          }}
        >
          <Plus size={18} />
          Plant New Asset
        </Button>
      </div>

      {crops.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No Crops Yet"
          description="Start by planting your first crop"
          action={
            <Button
              variant="primary"
              onClick={() => {
                setEditingCrop(null);
                setShowForm(true);
              }}
            >
              Plant Your First Crop
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <Card key={crop._id} className="hover:shadow-2xl transition-all !p-6 border-[#E0E0E0]">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-[#1A1A2E] tracking-tight">
                    {crop.cropName}
                  </h3>
                  <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-widest mt-1">
                    🏢 {farms.find((f) => f._id === crop.farm)?.farmName || 'Unknown Farm'}
                  </p>
                </div>
                <Badge className={`font-black !rounded-lg !px-3 border ${crop.status === 'growing' ? '!bg-[#EAF9F1] !text-[#2ECC71] border-[#C3E6CB]' : '!bg-[#F8F9FA] !text-[#636E72] border-[#E0E0E0]'}`}>
                  {crop.status?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'N/A'}
                </Badge>
              </div>

              <div className="space-y-3 mb-6 p-4 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0]">
                <p className="flex justify-between text-xs">
                  <span className="font-bold text-[#636E72] uppercase tracking-tighter">Crop Type</span>
                  <span className="font-extrabold text-[#1A1A2E]">{crop.cropType?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'N/A'}</span>
                </p>
                <p className="flex justify-between text-xs">
                  <span className="font-bold text-[#636E72] uppercase tracking-tighter">Genesis Date</span>
                  <span className="font-extrabold text-[#1A1A2E]">{formatDate(crop.plantingDate)}</span>
                </p>
                <p className="flex justify-between text-xs">
                  <span className="font-bold text-[#636E72] uppercase tracking-tighter">Harvest Projection</span>
                  <span className="font-extrabold text-[#1A1A2E]"> {crop.expectedHarvestDate ? formatDate(crop.expectedHarvestDate) : 'TBD'}</span>
                </p>
                <p className="flex justify-between text-xs">
                  <span className="font-bold text-[#636E72] uppercase tracking-tighter">Territory</span>
                  <span className="font-extrabold text-[#1A1A2E]">{crop.areaPlanted || 'N/A'} ACRES</span>
                </p>
              </div>

              {crop.yieldEstimate?.quantity && (
                <div className="mb-6 p-3 bg-[#EAF9F1] border border-[#C3E6CB] rounded-xl flex justify-between items-center">
                  <span className="text-[10px] font-black text-[#2ECC71] uppercase tracking-widest">Est. Output Intelligence</span>
                  <span className="text-sm font-black text-[#2ECC71]">{crop.yieldEstimate.quantity} {crop.yieldEstimate.unit || 'UNITS'}</span>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-[#E0E0E0]">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 !bg-[#F8F9FA] !text-[#1A1A2E] font-bold !rounded-xl border border-[#E0E0E0] hover:!bg-[#E0E0E0]"
                  onClick={() => {
                    setEditingCrop(crop);
                    setShowForm(true);
                  }}
                >
                  <Edit2 size={14} />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 !bg-[#FFF5F5] !text-[#E53E3E] font-bold !rounded-xl border border-[#FED7D7] hover:!bg-[#FED7D7]"
                  onClick={() => handleDelete(crop._id)}
                >
                  <Trash2 size={14} />
                  Terminate
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
          setEditingCrop(null);
          reset();
        }}
        title={editingCrop ? 'Edit Crop' : 'Plant New Crop'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Crop Name"
            name="cropName"
            value={values.cropName}
            onChange={handleChange}
            placeholder="e.g., Wheat, Rice, Tomato"
            required
          />

          <Select
            label="Crop Type"
            name="cropType"
            value={values.cropType}
            onChange={handleChange}
            options={CROP_TYPES.map((type) => ({
              value: type,
              label: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            }))}
            required
          />

          <Select
            label="Farm"
            name="farm"
            value={values.farm}
            onChange={handleChange}
            options={farms.map((f) => ({
              value: f._id,
              label: f.farmName,
            }))}
            required
          />

          <Input
            label="Planting Date"
            name="plantingDate"
            type="date"
            value={values.plantingDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Expected Harvest Date"
            name="expectedHarvestDate"
            type="date"
            value={values.expectedHarvestDate}
            onChange={handleChange}
          />

          <Select
            label="Status"
            name="status"
            value={values.status}
            onChange={handleChange}
            options={CROP_STAGES.map((stage) => ({
              value: stage,
              label: stage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            }))}
          />

          <Input
            label="Area Planted (acres)"
            name="areaPlanted"
            type="number"
            step="0.01"
            value={values.areaPlanted}
            onChange={handleChange}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {editingCrop ? 'Update Crop' : 'Plant Crop'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowForm(false);
                setEditingCrop(null);
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

export default CropListPage;
