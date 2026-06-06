import { ref } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/vue-query'
import { user } from './useAuth'
import { useI18n } from './nuxt-compat'

const defaultCurrency = ref<string>('IDR')

export const loadCurrency = async () => {
  const supabase = useSupabase()
  if (!user.value) {
    return
  }
  const { data } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user.value.id)
    .single()
  if (data?.currency) {
    defaultCurrency.value = data.currency
  }
}

// In-memory fallback cache for exchange rates fetched directly from the API
// when the Supabase exchange_rates table is missing a needed currency.
const fallbackRates = ref<Record<string, number> | null>(null)
let fallbackFetchPromise: Promise<void> | null = null

const fetchFallbackRates = async () => {
  if (fallbackFetchPromise) return fallbackFetchPromise
  fallbackFetchPromise = (async () => {
    try {
      const res = await fetch('https://api.exchangerate.fun/latest?base=IDR')
      if (!res.ok) return
      const data = await res.json()
      if (data?.rates) {
        // Add the base currency itself (1 IDR = 1 IDR)
        fallbackRates.value = { IDR: 1, ...data.rates }
      }
    } catch {
      // Reset so next attempt can retry
      fallbackFetchPromise = null
    }
  })()
  await fallbackFetchPromise
}

// Eagerly kick off the fallback fetch so rates are ready ASAP
fetchFallbackRates()

export const useCurrency = () => {
  const { t } = useI18n()

  // --- Exchange rates from Supabase (synced via Edge Function) ---
  const { data: ratesData } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const supabase = useSupabase()
      const { data, error } = await supabase.from('exchange_rates').select('target_currency, rate')
      if (error) throw error
      const map: Record<string, number> = {}
      for (const row of data || []) {
        map[row.target_currency] = Number(row.rate)
      }
      return map
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
  })

  const exchangeRates = ratesData

  const convertTo = (amount: number, fromCurrency: string, toCurrency: string): number | null => {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amount
    if (amount === 0) return 0

    const baseCurrency = defaultCurrency.value

    // Try DB-stored rates first
    const stored = exchangeRates.value
    if (stored) {
      const rateFrom = stored[fromCurrency]
      const rateTo = stored[toCurrency]
      if (rateFrom && rateTo) {
        const inBase = fromCurrency === baseCurrency ? amount : amount / rateFrom
        return toCurrency === baseCurrency ? inBase : inBase * rateTo
      }
    }

    // Fallback: try API-fetched rates (cached in memory)
    const fb = fallbackRates.value
    if (fb) {
      const rateFrom = fb[fromCurrency]
      const rateTo = fb[toCurrency]
      if (rateFrom && rateTo) {
        const inBase = fromCurrency === baseCurrency ? amount : amount / rateFrom
        return toCurrency === baseCurrency ? inBase : inBase * rateTo
      }
    }

    // Neither source has the rate — trigger a one-shot API fetch for next time
    fetchFallbackRates()

    return null
  }

  const noDecimalCurrencies = ['IDR', 'JPY', 'KRW', 'VND', 'KHR', 'LAK', 'MMK']

  const hasDecimals = (currency?: string) => {
    return !noDecimalCurrencies.includes(currency || defaultCurrency.value)
  }

  const formatCurrency = (amount: number, currency?: string) => {
    const cur = currency || defaultCurrency.value
    return new Intl.NumberFormat(getLocale(cur), {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: hasDecimals(cur) ? 2 : 0,
      maximumFractionDigits: hasDecimals(cur) ? 2 : 0,
    }).format(amount)
  }

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
    }
    return localeMap[currency] ?? 'en-US'
  }

  const currencyGroups = computed(() => [
    {
      label: t('currencies.group_southeast_asia'),
      currencies: [
        { value: 'IDR', label: t('currencies.idr') },
        { value: 'MYR', label: t('currencies.myr') },
        { value: 'SGD', label: t('currencies.sgd') },
        { value: 'THB', label: t('currencies.thb') },
        { value: 'PHP', label: t('currencies.php') },
        { value: 'VND', label: t('currencies.vnd') },
        { value: 'MMK', label: t('currencies.mmk') },
        { value: 'KHR', label: t('currencies.khr') },
        { value: 'LAK', label: t('currencies.lak') },
        { value: 'BND', label: t('currencies.bnd') },
      ],
    },
    {
      label: t('currencies.group_east_asia'),
      currencies: [
        { value: 'JPY', label: t('currencies.jpy') },
        { value: 'KRW', label: t('currencies.krw') },
        { value: 'CNY', label: t('currencies.cny') },
        { value: 'TWD', label: t('currencies.twd') },
        { value: 'HKD', label: t('currencies.hkd') },
      ],
    },
    {
      label: t('currencies.group_south_asia'),
      currencies: [
        { value: 'INR', label: t('currencies.inr') },
        { value: 'BDT', label: t('currencies.bdt') },
        { value: 'PKR', label: t('currencies.pkr') },
        { value: 'LKR', label: t('currencies.lkr') },
        { value: 'NPR', label: t('currencies.npr') },
      ],
    },
  ])

  const currencies = computed(() => currencyGroups.value.flatMap((g) => g.currencies))

  const formatNumberOnly = (amount: number, currency?: string) => {
    const cur = currency || defaultCurrency.value
    return new Intl.NumberFormat(getLocale(cur), {
      minimumFractionDigits: hasDecimals(cur) ? 2 : 0,
      maximumFractionDigits: hasDecimals(cur) ? 2 : 0,
    }).format(amount)
  }

  const parseLocalizedNumber = (str: string, currency?: string): number => {
    const cur = currency || defaultCurrency.value
    const digits = str.replace(/\D/g, '')
    if (!digits) {
      return 0
    }
    const num = Number(digits)
    if (hasDecimals(cur)) {
      return num / 100
    }
    return num
  }

  return {
    formatCurrency,
    formatNumberOnly,
    parseLocalizedNumber,
    hasDecimals,
    currencies,
    currencyGroups,
    defaultCurrency,
    exchangeRates,
    convertTo,
  }
}
