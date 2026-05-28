// app/plugins/currency.client.ts
export default defineNuxtPlugin(() => {
  const { fetchRates } = useCurrency();

  // Fetch rates in background
  onNuxtReady(() => {
    fetchRates();
  });
});
