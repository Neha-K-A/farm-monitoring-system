import { useEffect, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import distributorService from '../../../services/distributorService.js';
import { Truck, Phone, MapPin, Mail } from 'lucide-react';

const DistributorPage = () => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error: notifyError } = useNotification();

  useEffect(() => {
    loadDistributors();
  }, []);

  const loadDistributors = async () => {
    try {
      setLoading(true);
      const data = await distributorService.getDistributors();
      setDistributors(data || []);
    } catch (err) {
      notifyError('Failed to load distributors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
            <Truck className="text-[#2ECC71]" size={32} />
            Supply Chain Network
          </h1>
          <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Locate verified local distributors, seed suppliers, and chemical logistics.</p>
        </div>

        {distributors.length === 0 ? (
          <EmptyState title="No distributors found" description="Check back later for distributors in your area" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {distributors.map((dist) => (
              <Card key={dist._id} className="hover:shadow-2xl transition-all !p-6 border-[#E0E0E0] !bg-white group overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-extrabold text-[#1A1A2E] tracking-tight group-hover:text-[#2ECC71] transition-colors">{dist.name}</h3>
                  {dist.category && (
                    <Badge className="!bg-[#EAF9F1] !text-[#2ECC71] border border-[#C3E6CB] font-black !rounded-lg !px-3">{dist.category?.toUpperCase()}</Badge>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  {dist.address && (
                    <div className="flex gap-4 p-3 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0] text-[#1A1A2E] font-bold">
                      <MapPin size={18} className="text-[#2ECC71] flex-shrink-0" />
                      <span className="text-xs leading-relaxed">{dist.address}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    {dist.phone && (
                      <div className="flex gap-4 p-3 bg-white border border-[#E0E0E0] rounded-xl items-center text-[#1A1A2E] font-bold">
                        <Phone size={16} className="text-[#2ECC71]" />
                        <a href={`tel:${dist.phone}`} className="text-xs hover:text-[#2ECC71] transition-colors tracking-tight">
                          {dist.phone}
                        </a>
                      </div>
                    )}

                    {dist.email && (
                      <div className="flex gap-4 p-3 bg-white border border-[#E0E0E0] rounded-xl items-center text-[#1A1A2E] font-bold">
                        <Mail size={16} className="text-[#2ECC71]" />
                        <a href={`mailto:${dist.email}`} className="text-xs hover:text-[#2ECC71] transition-colors break-all tracking-tight">
                          {dist.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {dist.specialistIn && (
                  <div className="mt-6 pt-5 border-t border-[#F1F3F5]">
                    <p className="text-[10px] font-black text-[#636E72] mb-2 uppercase tracking-widest">Specialist Expertise</p>
                    <p className="text-xs text-[#1A1A2E] font-extrabold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]"></span>
                      {dist.specialistIn}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DistributorPage;
