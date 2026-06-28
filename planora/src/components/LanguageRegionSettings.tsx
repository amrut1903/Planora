import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/app';
import { Globe, Clock, Calendar as CalendarIcon, Check, ChevronDown, Search } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { useDateFormatter, regions, getCurrencySymbol } from '../lib/formatters';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
];

const timezones = Intl.supportedValuesOf('timeZone');

export function LanguageRegionSettings() {
  const { settings, updateSettings } = useAppStore();
  const { t } = useTranslation();
  const { formatDateTime } = useDateFormatter();
  
  const [now, setNow] = useState(new Date());
  const [tzOpen, setTzOpen] = useState(false);
  const [tzSearch, setTzSearch] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const regionSettings = settings.region;
  
  const filteredTimezones = timezones.filter(tz => tz.toLowerCase().includes(tzSearch.toLowerCase()));
  
  const filteredLanguages = languages.filter(
    l => l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
         l.nativeName.toLowerCase().includes(langSearch.toLowerCase())
  );

  const getTimezoneTime = (tz: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: regionSettings.timeFormat === '12' }).format(now);
    } catch {
      return '';
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2 text-white font-semibold mb-3">
        <Globe size={18} className="text-brand-primary" /> {t('settings.languageRegionTime')}
      </div>
      
      {/* Preview Card */}
      <div className="bg-brand-primary/10 rounded-[20px] p-4 mb-4 border border-brand-primary/20">
        <div className="text-xs font-semibold text-brand-primary mb-2 uppercase tracking-wide">{t('settings.preview')}</div>
        <div className="text-sm font-medium text-white mb-1">
          {formatDateTime(now)}
        </div>
        <div className="text-xs text-brand-secondary flex items-center gap-2">
          <span>{languages.find(l => l.code === regionSettings.language)?.nativeName}</span>
          <span>•</span>
          <span>{regions.find(r => r.code === regionSettings.regionCode)?.name} ({getCurrencySymbol(regionSettings.regionCode)})</span>
        </div>
      </div>

      <div className="bg-brand-card rounded-[20px] border border-black/5 overflow-hidden shadow-sm flex flex-col divide-y divide-black/5">
        
        {/* Language */}
        <div className="p-4 flex justify-between items-center">
          <div className="text-sm font-semibold text-brand-text-primary">{t('settings.language')}</div>
          <button
            onClick={() => setLangOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-lg hover:bg-brand-primary/20 transition-colors max-w-[160px]"
          >
            <Globe size={14} />
            <span className="truncate">
              {languages.find(l => l.code === regionSettings.language)?.nativeName || 'English'}
            </span>
            <ChevronDown size={14} className="shrink-0" />
          </button>
        </div>

        {/* Region */}
        <div className="p-4">
          <div className="text-sm font-semibold text-brand-text-primary mb-3">{t('settings.region')}</div>
          <select 
            className="w-full bg-white border border-black/5 rounded-xl p-3 text-sm font-medium text-brand-text-primary outline-none focus:ring-2 focus:ring-brand-primary shadow-sm appearance-none"
            value={regionSettings.regionCode}
            onChange={e => updateSettings({
              region: { ...regionSettings, regionCode: e.target.value },
              privacy: { ...settings.privacy, country: e.target.value }
            })}
          >
            {regions.map(r => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Date Format */}
        <div className="p-4">
          <div className="text-sm font-semibold text-brand-text-primary mb-3">{t('settings.dateFormat')}</div>
          <select 
            className="w-full bg-white border border-black/5 rounded-xl p-3 text-sm font-medium text-brand-text-primary outline-none focus:ring-2 focus:ring-brand-primary shadow-sm appearance-none"
            value={regionSettings.dateFormat}
            onChange={e => updateSettings({ region: { ...regionSettings, dateFormat: e.target.value } })}
          >
            <option value="dd/MM/yyyy">dd/MM/yyyy (25/06/2026)</option>
            <option value="MM/dd/yyyy">MM/dd/yyyy (06/25/2026)</option>
            <option value="yyyy-MM-dd">yyyy-MM-dd (2026-06-25)</option>
            <option value="dd MMM yyyy">dd MMM yyyy (25 Jun 2026)</option>
          </select>
        </div>

        {/* Time Format */}
        <div className="p-4 flex justify-between items-center">
          <div className="text-sm font-semibold text-brand-text-primary">{t('settings.timeFormat')}</div>
          <div className="flex bg-brand-secondary/10 p-1 rounded-lg">
            <button 
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${regionSettings.timeFormat === '12' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-text-secondary'}`}
              onClick={() => updateSettings({ region: { ...regionSettings, timeFormat: '12' } })}
            >
              {t('settings.timeFormat.12')}
            </button>
            <button 
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${regionSettings.timeFormat === '24' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-text-secondary'}`}
              onClick={() => updateSettings({ region: { ...regionSettings, timeFormat: '24' } })}
            >
              {t('settings.timeFormat.24')}
            </button>
          </div>
        </div>

        {/* Timezone */}
        <div className="p-4 flex justify-between items-center">
          <div className="text-sm font-semibold text-brand-text-primary">{t('settings.timezone')}</div>
          <button
            onClick={() => setTzOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-lg hover:bg-brand-primary/20 transition-colors max-w-[180px] truncate"
          >
            <Clock size={14} />
            <span className="truncate">{regionSettings.timezone}</span>
            <ChevronDown size={14} className="shrink-0" />
          </button>
        </div>

        {/* First Day of Week */}
        <div className="p-4 flex justify-between items-center">
          <div className="text-sm font-semibold text-brand-text-primary">{t('settings.firstDay')}</div>
          <div className="flex bg-brand-secondary/10 p-1 rounded-lg">
            <button 
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${regionSettings.firstDay === '0' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-text-secondary'}`}
              onClick={() => updateSettings({ region: { ...regionSettings, firstDay: '0' } })}
            >
              {t('settings.sunday')}
            </button>
            <button 
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${regionSettings.firstDay === '1' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-text-secondary'}`}
              onClick={() => updateSettings({ region: { ...regionSettings, firstDay: '1' } })}
            >
              {t('settings.monday')}
            </button>
          </div>
        </div>

        {/* Language Dialog */}
        {langOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setLangOpen(false); setLangSearch(''); }}
            />
            {/* Sheet */}
            <div className="relative w-full max-w-md bg-white rounded-t-[28px] shadow-2xl flex flex-col max-h-[80vh]">
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4 shrink-0" />

              {/* Header */}
              <div className="px-5 pb-3 shrink-0">
                <h2 className="text-lg font-bold text-brand-text-primary">{t('settings.language')}</h2>
                <p className="text-xs text-brand-text-secondary mt-0.5">Choose your preferred app language</p>
              </div>

              {/* Search */}
              <div className="px-5 pb-3 shrink-0">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search language..."
                    className="w-full bg-gray-50 border border-black/10 rounded-xl py-2.5 pl-9 pr-3 text-sm font-medium text-brand-text-primary outline-none focus:ring-2 focus:ring-brand-primary"
                    value={langSearch}
                    onChange={e => setLangSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-3 pb-6">
                {filteredLanguages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      updateSettings({ region: { ...regionSettings, language: lang.code } });
                      setLangOpen(false);
                      setLangSearch('');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors mb-0.5 ${
                      regionSettings.language === lang.code
                        ? 'bg-brand-primary/10'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${regionSettings.language === lang.code ? 'text-brand-primary' : 'text-brand-text-primary'}`}>
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-brand-text-secondary">{lang.name}</span>
                    </div>
                    {regionSettings.language === lang.code && (
                      <Check size={16} className="text-brand-primary shrink-0" />
                    )}
                  </button>
                ))}
                {filteredLanguages.length === 0 && (
                  <div className="text-center py-10 text-sm text-brand-text-secondary">No languages found</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timezone Dialog */}
        {tzOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setTzOpen(false); setTzSearch(''); }}
            />
            {/* Sheet */}
            <div className="relative w-full max-w-md bg-white rounded-t-[28px] shadow-2xl flex flex-col max-h-[80vh]">
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4 shrink-0" />
              
              {/* Header */}
              <div className="px-5 pb-3 shrink-0">
                <h2 className="text-lg font-bold text-brand-text-primary">{t('settings.timezone')}</h2>
                <p className="text-xs text-brand-text-secondary mt-0.5">Select your local time zone</p>
              </div>

              {/* Search */}
              <div className="px-5 pb-3 shrink-0">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
                  <input
                    autoFocus
                    type="text"
                    placeholder={t('settings.searchTimezone')}
                    className="w-full bg-gray-50 border border-black/10 rounded-xl py-2.5 pl-9 pr-3 text-sm font-medium text-brand-text-primary outline-none focus:ring-2 focus:ring-brand-primary"
                    value={tzSearch}
                    onChange={e => setTzSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-3 pb-6">
                {filteredTimezones.slice(0, 150).map(tz => (
                  <button
                    key={tz}
                    onClick={() => {
                      updateSettings({ region: { ...regionSettings, timezone: tz } });
                      setTzOpen(false);
                      setTzSearch('');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl flex justify-between items-center transition-colors mb-0.5 ${
                      regionSettings.timezone === tz
                        ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                        : 'text-brand-text-primary hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate pr-3 text-sm">{tz}</span>
                    <span className="text-xs text-brand-text-secondary whitespace-nowrap shrink-0">
                      {getTimezoneTime(tz)}
                    </span>
                  </button>
                ))}
                {filteredTimezones.length === 0 && (
                  <div className="text-center py-10 text-sm text-brand-text-secondary">No time zones found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
