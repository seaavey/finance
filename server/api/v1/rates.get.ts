// server/api/v1/rates.get.ts
export default defineCachedEventHandler(
  async (event) => {
    try {
      const data = await $fetch<any>('https://api.exchangerate.fun/latest?base=IDR');

      // Transform to slim format
      return {
        base: data.base || 'IDR',
        rates: data.rates,
        updated_at: Date.now(),
      };
    } catch (error) {
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
