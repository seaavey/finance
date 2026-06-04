import { ref } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/vue-query'
import { user } from './useAuth'

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
  ]

  const currencies = currencyGroups.flatMap((g) => g.currencies)

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
