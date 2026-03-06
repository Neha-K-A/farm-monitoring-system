import { useEffect, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Select from '../../../components/Common/Select.jsx';
import Button from '../../../components/Common/Button.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import { useAuth } from '../../../hooks/useAuth.js';
import languageService from '../../../services/languageService.js';
import { Globe, Check } from 'lucide-react';

const LanguagePage = () => {
  const { user, updateUser } = useAuth();
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState(user?.language || 'en');
  const [loading, setLoading] = useState(true);
  const { success, error: notifyError } = useNotification();

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      setLoading(true);
      const data = await languageService.getSupportedLanguages();
      setLanguages(data || []);
    } catch (err) {
      notifyError('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLanguage = async (langCode) => {
    try {
      await languageService.setLanguagePreference(langCode);
      setSelectedLang(langCode);
      success('Language preference updated!');
      // Update user context if available
      if (updateUser) {
        updateUser({ ...user, language: langCode });
      }
    } catch (err) {
      notifyError('Failed to update language preference');
    }
  };

  if (loading) return <Loader />;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
            <Globe className="text-[#3498DB]" size={32} />
            Linguistic Configuration
          </h1>
          <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Select your preferred interface language for a localized monitoring experience.</p>
        </div>

        {languages.length === 0 ? (
          <EmptyState title="No languages available" description="Try again later" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {languages.map((lang) => (
              <Card
                key={lang.code}
                onClick={() => handleChangeLanguage(lang.code)}
                className={`cursor-pointer transition-all !p-6 border-[#E0E0E0] rounded-2xl group relative overflow-hidden ${selectedLang === lang.code
                    ? 'ring-2 ring-[#2ECC71] !bg-[#EAF9F1] shadow-lg'
                    : 'hover:shadow-2xl !bg-white'
                  }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className={`text-lg font-black tracking-tight transition-colors ${selectedLang === lang.code ? 'text-[#155724]' : 'text-[#1A1A2E] group-hover:text-[#2ECC71]'}`}>{lang.name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${selectedLang === lang.code ? 'text-[#2ECC71]' : 'text-[#636E72]'}`}>{lang.nativeName}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedLang === lang.code ? 'bg-white text-[#2ECC71] shadow-sm' : 'bg-[#F8F9FA] text-[#CBD5E0] group-hover:bg-[#EAF9F1] group-hover:text-[#2ECC71]'}`}>
                    <Check size={20} className={selectedLang === lang.code ? 'opacity-100' : 'opacity-0'} />
                    {selectedLang !== lang.code && <Globe size={20} className="opacity-100" />}
                  </div>
                </div>
                {selectedLang === lang.code && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#2ECC71] opacity-5 -mr-12 -mt-12 rounded-full blur-2xl"></div>
                )}
              </Card>
            ))}
          </div>
        )}

        <Card className="!bg-[#EBF8FF] border-[#BEE3F8] !p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3498DB]"></div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#3498DB]">
              <Lightbulb size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#2B6CB0] mb-2 uppercase tracking-[0.2em]">INTELLIGENT LOCALIZATION</h3>
              <p className="text-sm text-[#2B6CB0] font-bold leading-relaxed">
                Switching languages will dynamically re-route the interface through our localization engine.
                Real-time translation for sensor metrics and predictive analytics may involve minor latency.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LanguagePage;
