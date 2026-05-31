import { ref } from 'vue';
import { useSupabase } from '@/lib/supabase';
import { user } from './useAuth';

// Module-level singleton — shared across all useCurrency() calls
const defaultCurrency = ref<string>('IDR');
const exchangeRates = ref<Record<string, number> | null>(null);
const isRatesLoading = ref(false);

export const loadCurrency = async () => {
  const supabase = useSupabase();
  if (!user.value) {
    return;
  }
  const { data } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user.value.id)
    .single();
  if (data?.currency) {
    defaultCurrency.value = data.currency;
  }
};

export const useCurrency = () => {

  const fetchRates = async () => {
    if (exchangeRates.value) {
      return;
    }
    isRatesLoading.value = true;
    try {
      const response = await fetch('/api/v1/rates');
      const data = await response.json();
      exchangeRates.value = data.rates;
    } catch (error) {
      console.error('Failed to fetch rates:', error);
    } finally {
      isRatesLoading.value = false;
    }
  };

  const convertTo = (amount: number, targetCurrency: string = 'USD') => {
    if (!exchangeRates.value || !exchangeRates.value[targetCurrency]) {
      return null;
    }
    // Base is assumed to be IDR as per API config
    const rate = exchangeRates.value[targetCurrency];
    return amount * rate;
  };

  const noDecimalCurrencies = ['IDR', 'JPY', 'KRW', 'VND', 'KHR', 'LAK', 'MMK'];

  const hasDecimals = (currency?: string) => {
    return !noDecimalCurrencies.includes(currency || defaultCurrency.value);
  };

  const formatCurrency = (amount: number, currency?: string) => {
    const cur = currency || defaultCurrency.value;
    return new Intl.NumberFormat(getLocale(cur), {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: hasDecimals(cur) ? 2 : 0,
      maximumFractionDigits: hasDecimals(cur) ? 2 : 0,
    }).format(amount);
  };

  const getLocale = (currency: string) => {
    const localeMap: Record<string, string> = {
      IDR: 'id-ID',
      MYR: 'ms-MY',
      SGD: 'en-SG',
      THB: 'th-TH',
      PHP: 'en-PH',
      VND: 'vi-VN',
      MMK: 'my-MM',
      KHR: 'km-KH',
      LAK: 'lo-LA',
      BND: 'ms-BN',
      JPY: 'ja-JP',
      KRW: 'ko-KR',
      CNY: 'zh-CN',
      TWD: 'zh-TW',
      HKD: 'zh-HK',
      INR: 'en-IN',
      BDT: 'bn-BD',
      PKR: 'en-PK',
      LKR: 'si-LK',
      NPR: 'ne-NP',
    };
    return localeMap[currency] ?? 'en-US';
  };

  const currencyGroups = [
    {
      label: 'Asia Tenggara',
      currencies: [
        { value: 'IDR', label: 'IDR - Rupiah Indonesia' },
        { value: 'MYR', label: 'MYR - Ringgit Malaysia' },
        { value: 'SGD', label: 'SGD - Dollar Singapura' },
        { value: 'THB', label: 'THB - Baht Thailand' },
        { value: 'PHP', label: 'PHP - Peso Filipina' },
        { value: 'VND', label: 'VND - Dong Vietnam' },
        { value: 'MMK', label: 'MMK - Kyat Myanmar' },
        { value: 'KHR', label: 'KHR - Riel Kamboja' },
        { value: 'LAK', label: 'LAK - Kip Laos' },
        { value: 'BND', label: 'BND - Dollar Brunei' },
      ],
    },
    {
      label: 'Asia Timur',
      currencies: [
        { value: 'JPY', label: 'JPY - Yen Jepang' },
        { value: 'KRW', label: 'KRW - Won Korea' },
        { value: 'CNY', label: 'CNY - Yuan Tiongkok' },
        { value: 'TWD', label: 'TWD - Dollar Taiwan' },
        { value: 'HKD', label: 'HKD - Dollar Hong Kong' },
      ],
    },
    {
      label: 'Asia Selatan',
      currencies: [
        { value: 'INR', label: 'INR - Rupee India' },
        { value: 'BDT', label: 'BDT - Taka Bangladesh' },
        { value: 'PKR', label: 'PKR - Rupee Pakistan' },
        { value: 'LKR', label: 'LKR - Rupee Sri Lanka' },
        { value: 'NPR', label: 'NPR - Rupee Nepal' },
      ],
    },
  ];

  const currencies = currencyGroups.flatMap((g) => g.currencies);

  const formatNumberOnly = (amount: number, currency?: string) => {
    const cur = currency || defaultCurrency.value;
    return new Intl.NumberFormat(getLocale(cur), {
      minimumFractionDigits: hasDecimals(cur) ? 2 : 0,
      maximumFractionDigits: hasDecimals(cur) ? 2 : 0,
    }).format(amount);
  };

  const parseLocalizedNumber = (str: string, currency?: string): number => {
    const cur = currency || defaultCurrency.value;
    // Extract only digits
    const digits = str.replace(/\D/g, '');
    if (!digits) {
      return 0;
    }
    const num = Number(digits);
    if (hasDecimals(cur)) {
      return num / 100;
    }
    return num;
  };

  return {
    formatCurrency,
    formatNumberOnly,
    parseLocalizedNumber,
    hasDecimals,
    currencies,
    currencyGroups,
    defaultCurrency,
    exchangeRates,
    fetchRates,
    convertTo,
    isRatesLoading,
  };
};
