import { useSupabase } from '~/lib/supabase'

export const useCurrency = () => {
  const { t } = useI18n()
  const supabase = useSupabase()
  const { user } = useAuth()

  const defaultCurrency = useState<string>('default-currency', () => 'IDR')

  const loadCurrency = async () => {
    if (!user.value) return
    const { data } = await supabase
      .from('profiles')
      .select('currency')
      .eq('id', user.value.id)
      .single()
    if (data?.currency) {
      defaultCurrency.value = data.currency
    }
  }

  const formatCurrency = (amount: number, currency?: string) => {
    const cur = currency || defaultCurrency.value
    const noDecimalCurrencies = ['IDR', 'JPY', 'KRW', 'VND', 'KHR', 'LAK', 'MMK']
    return new Intl.NumberFormat(getLocale(cur), {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: noDecimalCurrencies.includes(cur) ? 0 : 2,
    }).format(amount)
  }

  const getLocale = (currency: string) => {
    const { locale } = useI18n()
    const localeMap: Record<string, string> = {
      IDR: locale.value,
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
    }
    return localeMap[currency] ?? 'en-US'
  }

  const currencyGroups = [
    {
      label: t('currencies.group_southeast_asia'),
      currencies: [
        { value: 'IDR', label: t('currencies.IDR') },
        { value: 'MYR', label: t('currencies.MYR') },
        { value: 'SGD', label: t('currencies.SGD') },
        { value: 'THB', label: t('currencies.THB') },
        { value: 'PHP', label: t('currencies.PHP') },
        { value: 'VND', label: t('currencies.VND') },
        { value: 'MMK', label: t('currencies.MMK') },
        { value: 'KHR', label: t('currencies.KHR') },
        { value: 'LAK', label: t('currencies.LAK') },
        { value: 'BND', label: t('currencies.BND') },
      ],
    },
    {
      label: t('currencies.group_east_asia'),
      currencies: [
        { value: 'JPY', label: t('currencies.JPY') },
        { value: 'KRW', label: t('currencies.KRW') },
        { value: 'CNY', label: t('currencies.CNY') },
        { value: 'TWD', label: t('currencies.TWD') },
        { value: 'HKD', label: t('currencies.HKD') },
      ],
    },
    {
      label: t('currencies.group_south_asia'),
      currencies: [
        { value: 'INR', label: t('currencies.INR') },
        { value: 'BDT', label: t('currencies.BDT') },
        { value: 'PKR', label: t('currencies.PKR') },
        { value: 'LKR', label: t('currencies.LKR') },
        { value: 'NPR', label: t('currencies.NPR') },
      ],
    },
  ]

  const currencies = currencyGroups.flatMap(g => g.currencies)

  return { formatCurrency, currencies, currencyGroups, loadCurrency, defaultCurrency }
}
