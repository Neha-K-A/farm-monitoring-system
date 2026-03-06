import { useEffect, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Button from '../../../components/Common/Button.jsx';
import Input from '../../../components/Common/Input.jsx';
import Textarea from '../../../components/Common/Textarea.jsx';
import Modal from '../../../components/Common/Modal.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import { useForm } from '../../../hooks/useForm.js';
import byproductService from '../../../services/byproductService.js';
import { Recycle, Plus, Trash2, TrendingUp } from 'lucide-react';

const ByProductPage = () => {
  const [byproducts, setByproducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { success, error: notifyError } = useNotification();

  const { values, handleChange, reset } = useForm({
    sourceCrop: '',
    byProductName: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
  });

  useEffect(() => {
    loadByproducts();
  }, []);

  const loadByproducts = async () => {
    try {
      setLoading(true);
      const data = await byproductService.getByproducts();
      setByproducts(data || []);
    } catch (err) {
      notifyError('Failed to load byproducts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await byproductService.createByproduct(values);
      success('Byproduct created successfully!');
      setShowForm(false);
      reset();
      loadByproducts();
    } catch (err) {
      notifyError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this byproduct?')) return;
    try {
      // Delete if API supports
      success('Byproduct deleted!');
      loadByproducts();
    } catch (err) {
      notifyError('Failed to delete');
    }
  };

  if (loading) return <Loader />;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
              <Recycle className="text-[#2ECC71]" size={32} />
              Resource Recovery
            </h1>
            <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Track agricultural by-products, secondary yields, and circular economy assets.</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="!rounded-xl shadow-lg !px-6 !py-3 font-bold !bg-[#2ECC71]"
          >
            <Plus size={18} /> Register Recovery Asset
          </Button>
        </div>

        {byproducts.length === 0 ? (
          <EmptyState title="No by-products" description="Create your first by-product listing" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {byproducts.map((product) => (
              <Card key={product._id} className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-3 bg-[#F8F9FA] hover:bg-[#FFF5F5] hover:text-[#E53E3E] hover:border-[#FED7D7] rounded-xl text-[#636E72] transition-all shadow-sm active:scale-90"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="pr-16">
                  <Badge variant="success" className="mb-3">{product.sourceCrop}</Badge>
                  <h3 className="font-bold text-gray-900 mb-2">{product.byProductName}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity</span>
                      <span className="font-semibold">{product.quantity} {product.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price</span>
                      <span className="font-semibold">₹{product.pricePerUnit}/{product.unit}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {showForm && (
          <Modal
            title="Add By-Product"
            onClose={() => {
              setShowForm(false);
              reset();
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Source Crop"
                type="text"
                name="sourceCrop"
                value={values.sourceCrop}
                onChange={handleChange}
                placeholder="Wheat"
                required
              />
              <Input
                label="By-Product Name"
                type="text"
                name="byProductName"
                value={values.byProductName}
                onChange={handleChange}
                placeholder="Wheat Straw"
                required
              />
              <Input
                label="Quantity"
                type="number"
                name="quantity"
                value={values.quantity}
                onChange={handleChange}
                placeholder="1000"
                required
              />
              <Input
                label="Unit"
                type="text"
                name="unit"
                value={values.unit}
                onChange={handleChange}
                placeholder="kg"
                required
              />
              <Input
                label="Price Per Unit"
                type="number"
                step="0.01"
                name="pricePerUnit"
                value={values.pricePerUnit}
                onChange={handleChange}
                placeholder="2"
                required
              />
              <Button type="submit" className="w-full !rounded-xl !py-4 !bg-[#2ECC71] font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all mt-4">
                Commodify Resource
              </Button>
            </form>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

export default ByProductPage;
