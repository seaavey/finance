// server/api/v1/rates.get.ts
interface ExchangeRatesData {
  base: string;
  rates: Record<string, number>;
}

export default defineCachedEventHandler(
  async (_event): Promise<ExchangeRatesData & { updated_at: number }> => {
    try {
      const data = await $fetch<ExchangeRatesData>('https://api.exchangerate.fun/latest?base=IDR');

      // Transform to slim format
      return {
        base: data.base || 'IDR',
        rates: data.rates,
        updated_at: Date.now(),
      };
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch exchange rates',
      });
    }
  },
  {
    maxAge: 3600, // 1 hour
    name: 'exchange-rates',
    getKey: () => 'latest',
  },
);
