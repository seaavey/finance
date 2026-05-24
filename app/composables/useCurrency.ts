export const useCurrency = () => {
  const formatCurrency = (amount: number, currency = 'IDR') => {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    }).format(amount)
  }

  const currencies = [
    { value: 'IDR', label: 'IDR - Rupiah' },
    { value: 'USD', label: 'USD - Dollar' },
    { value: 'BND', label: 'BND - Dollar Brunei' },
  ]

  return { formatCurrency, currencies }
}
