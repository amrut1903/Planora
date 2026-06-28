import { format, parseISO } from 'date-fns';
import { enUS, hi, es, fr, de, zhCN, ja, pt, ru, it, ko, ar, bn, tr, type Locale } from 'date-fns/locale';
import { useAppStore } from '../store/app';

// Note: date-fns does not have an official Odia locale yet. We can fallback to enUS or hi, or create a simple custom one if needed.
const locales: Record<string, Locale> = {
  en: enUS,
  hi: hi,
  or: enUS, // Fallback for Odia
  es,
  fr,
  de,
  zh: zhCN,
  ja,
  pt,
  ru,
  it,
  ko,
  ar,
  bn,
  tr,
};

const getLocale = (language: string) => locales[language] || enUS;

export const useDateFormatter = () => {
  const { region } = useAppStore((state) => state.settings);

  const formatDate = (date: Date | string, formatStr?: string) => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const fStr = formatStr || region.dateFormat;
    return format(parsedDate, fStr, { locale: getLocale(region.language) });
  };

  const formatTime = (date: Date | string) => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    // We use Intl.DateTimeFormat to support custom timezones easily
    return new Intl.DateTimeFormat(region.language === 'en' ? 'en-US' : region.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: region.timeFormat === '12',
      timeZone: region.timezone,
    }).format(parsedDate);
  };

  const formatDateTime = (date: Date | string) => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
  };
};

export const regions = [
  { code: 'US', name: 'United States',    currency: 'USD', symbol: '$' },
  { code: 'IN', name: 'India',            currency: 'INR', symbol: '₹' },
  { code: 'GB', name: 'United Kingdom',   currency: 'GBP', symbol: '£' },
  { code: 'CA', name: 'Canada',           currency: 'CAD', symbol: 'CA$' },
  { code: 'AU', name: 'Australia',        currency: 'AUD', symbol: 'A$' },
  { code: 'CN', name: 'China',            currency: 'CNY', symbol: '¥' },
  { code: 'JP', name: 'Japan',            currency: 'JPY', symbol: '¥' },
  { code: 'DE', name: 'Germany',          currency: 'EUR', symbol: '€' },
  { code: 'FR', name: 'France',           currency: 'EUR', symbol: '€' },
  { code: 'BR', name: 'Brazil',           currency: 'BRL', symbol: 'R$' },
  { code: 'MX', name: 'Mexico',           currency: 'MXN', symbol: 'MX$' },
  { code: 'KR', name: 'South Korea',      currency: 'KRW', symbol: '₩' },
  { code: 'RU', name: 'Russia',           currency: 'RUB', symbol: '₽' },
  { code: 'ZA', name: 'South Africa',     currency: 'ZAR', symbol: 'R' },
  { code: 'NG', name: 'Nigeria',          currency: 'NGN', symbol: '₦' },
  { code: 'PK', name: 'Pakistan',         currency: 'PKR', symbol: '₨' },
  { code: 'BD', name: 'Bangladesh',       currency: 'BDT', symbol: '৳' },
  { code: 'ID', name: 'Indonesia',        currency: 'IDR', symbol: 'Rp' },
  { code: 'PH', name: 'Philippines',      currency: 'PHP', symbol: '₱' },
  { code: 'MY', name: 'Malaysia',         currency: 'MYR', symbol: 'RM' },
  { code: 'SG', name: 'Singapore',        currency: 'SGD', symbol: 'S$' },
  { code: 'AE', name: 'UAE',              currency: 'AED', symbol: 'د.إ' },
  { code: 'SA', name: 'Saudi Arabia',     currency: 'SAR', symbol: '﷼' },
  { code: 'EG', name: 'Egypt',            currency: 'EGP', symbol: 'E£' },
  { code: 'KE', name: 'Kenya',            currency: 'KES', symbol: 'KSh' },
  { code: 'GH', name: 'Ghana',            currency: 'GHS', symbol: 'GH₵' },
  { code: 'IT', name: 'Italy',            currency: 'EUR', symbol: '€' },
  { code: 'ES', name: 'Spain',            currency: 'EUR', symbol: '€' },
  { code: 'NL', name: 'Netherlands',      currency: 'EUR', symbol: '€' },
  { code: 'SE', name: 'Sweden',           currency: 'SEK', symbol: 'kr' },
  { code: 'NO', name: 'Norway',           currency: 'NOK', symbol: 'kr' },
  { code: 'PL', name: 'Poland',           currency: 'PLN', symbol: 'zł' },
  { code: 'TR', name: 'Turkey',           currency: 'TRY', symbol: '₺' },
  { code: 'AR', name: 'Argentina',        currency: 'ARS', symbol: '$' },
  { code: 'CO', name: 'Colombia',         currency: 'COP', symbol: '$' },
  { code: 'NZ', name: 'New Zealand',      currency: 'NZD', symbol: 'NZ$' },
  { code: 'TH', name: 'Thailand',         currency: 'THB', symbol: '฿' },
  { code: 'VN', name: 'Vietnam',          currency: 'VND', symbol: '₫' },
  { code: 'UA', name: 'Ukraine',          currency: 'UAH', symbol: '₴' },
];

export const getCurrencySymbol = (regionCode: string) => {
  return regions.find(r => r.code === regionCode)?.symbol || '$';
};
