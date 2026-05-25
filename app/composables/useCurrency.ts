import { useSupabase } from '~/lib/supabase';

export const useCurrency = () => {
  const supabase = useSupabase();
  const { user } = useAuth();

  const defaultCurrency = useState<string>('default-currency', () => 'IDR');

  const loadCurrency = async () => {
    if (!user.value) return;
    const { data } = await supabase
      .from('profiles')
      .select('currency')
      .eq('id', user.value.id)
      .single();
    if (data?.currency) {
      defaultCurrency.value = data.currency;
    }
  };

  const formatCurrency = (amount: number, currency?: string) => {
    const cur = currency || defaultCurrency.value;
    const noDecimalCurrencies = ['IDR', 'JPY', 'KRW', 'VND', 'KHR', 'LAK', 'MMK'];
    return new Intl.NumberFormat(getLocale(cur), {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: noDecimalCurrencies.includes(cur) ? 0 : 2,
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

  return { formatCurrency, currencies, currencyGroups, loadCurrency, defaultCurrency };
};
