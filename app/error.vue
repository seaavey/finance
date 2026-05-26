<script setup lang="ts">
const props = defineProps({
  error: Object,
});

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-background text-foreground">
    <div class="max-w-md w-full space-y-6">
      <div class="space-y-2">
        <h1 class="text-9xl font-extrabold tracking-tighter text-primary/20">
          {{ error?.statusCode || '500' }}
        </h1>
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          {{ error?.statusCode === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan sistem' }}
        </h2>
        <p class="text-muted-foreground text-lg">
          {{ error?.statusCode === 404 
              ? 'Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.' 
              : 'Kami sedang mengalami masalah teknis. Silakan coba lagi nanti.' 
          }}
        </p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" @click="handleError">
          Kembali ke Beranda
        </Button>
        <Button variant="outline" size="lg" @click="navigateTo('/transactions')">
          Lihat Transaksi
        </Button>
      </div>
    </div>
  </div>
</template>
