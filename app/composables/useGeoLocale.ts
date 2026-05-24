export const useGeoLocale = () => {
  const { locale, setLocale } = useI18n()
  const cookie = useCookie('i18n_lang')

  const countryToLocale: Record<string, string> = {
    ID: 'id',
    MY: 'ms',
    BN: 'ms',
  }

  const detect = async () => {
    if (cookie.value) {
      return
    }

    try {
      const res = await fetch('http://ip-api.com/json/', { signal: AbortSignal.timeout(5000) })
      const data = await res.json()
      if (data.status === 'success') {
        const detected = countryToLocale[data.countryCode] || 'en'
        if (detected !== locale.value) {
          await setLocale(detected)
        }
      }
    } catch {
      // fallback to default locale
    }
  }

  return { detect }
}
