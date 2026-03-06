import { useEffect, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Select from '../../../components/Common/Select.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import recommendationService from '../../../services/recommendationService.js';
import farmService from '../../../services/farmService.js';
import { Lightbulb, Leaf, Droplets, Bug } from 'lucide-react';

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [loading, setLoading] = useState(true);
  const { error: notifyError } = useNotification();

  useEffect(() => {
    loadFarms();
  }, []);

  useEffect(() => {
    if (selectedFarm) {
      loadRecommendations();
    }
  }, [selectedFarm]);

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

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await recommendationService.getCropRecommendations(selectedFarm);
      setRecommendations(data || []);
    } catch (err) {
      notifyError('Failed to load recommendations');
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
            <Lightbulb className="text-[#F1C40F]" size={32} />
            Agronomic Intelligence
          </h1>
          <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Neural insights and dynamic cultivation strategies tailored to your territory.</p>
        </div>

        <Card className="!bg-white border-[#E0E0E0] shadow-sm !p-6 mb-10">
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

        {recommendations.length === 0 ? (
          <EmptyState title="No recommendations" description="Recommendations will appear here based on farm conditions" />
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <Card key={idx} className="!p-0 border-[#E0E0E0] hover:shadow-2xl transition-all !bg-white rounded-2xl overflow-hidden group border-l-0">
                <div className="flex h-full">
                  <div className={`w-2 flex-shrink-0 ${rec.priority === 'high' ? 'bg-[#E53E3E]' :
                      rec.priority === 'medium' ? 'bg-[#F1C40F]' : 'bg-[#2ECC71]'
                    }`}></div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-6">
                      <div className={`p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform ${rec.type === 'crop' ? 'bg-[#EAF9F1] text-[#2ECC71]' :
                          rec.type === 'irrigation' ? 'bg-[#EBF8FF] text-[#3498DB]' :
                            rec.type === 'pest' ? 'bg-[#FFF5F5] text-[#E53E3E]' : 'bg-[#FEF9E7] text-[#F1C40F]'
                        }`}>
                        {rec.type === 'crop' && <Leaf size={28} />}
                        {rec.type === 'irrigation' && <Droplets size={28} />}
                        {rec.type === 'pest' && <Bug size={28} />}
                        {rec.type === 'fertilizer' && <Lightbulb size={28} />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-black text-[#1A1A2E] tracking-tight group-hover:text-[#2ECC71] transition-colors">{rec.title}</h3>
                            <p className="text-[9px] font-black text-[#636E72] uppercase tracking-[0.2em] mt-1">{rec.type?.toUpperCase()} ADVISORY</p>
                          </div>
                          {rec.priority && (
                            <Badge className={`font-black uppercase tracking-widest text-[9px] !rounded-lg !px-3 !py-1 border ${rec.priority === 'high' ? '!bg-[#FFF5F5] !text-[#E53E3E] border-[#FED7D7]' :
                                '!bg-[#FEF9E7] !text-[#F1C40F] border-[#FAF089]'
                              }`}>
                              {rec.priority}
                            </Badge>
                          )}
                        </div>

                        <p className="text-[#1A1A2E] font-bold text-sm leading-relaxed mb-6">{rec.description}</p>

                        {rec.action && (
                          <div className="p-5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#2ECC71]"></div>
                            <p className="text-[9px] font-black text-[#2ECC71] uppercase tracking-[0.2em] mb-2">Optimization Protocol</p>
                            <p className="text-sm text-[#1A1A2E] font-extrabold">{rec.action}</p>
                          </div>
                        )}

                        {rec.expectedBenefit && (
                          <div className="mt-6 flex items-center gap-3 px-1">
                            <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">Projected Outcome:</span>
                            <span className="text-xs font-black text-[#2ECC71] uppercase">{rec.expectedBenefit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RecommendationPage;
