<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div
    style="
      width: 1200px;
      height: 630px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 80px;
      background-color: #0f172a;
      position: relative;
      overflow: hidden;
    "
  >
    <div
      style="display: flex; font-size: 18px; color: #ef4444; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;"
    >
      Finance App
    </div>
    <div
      style="display: flex; flex-direction: column; font-size: 64px; color: #f1f5f9; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em;"
    >
      <span>Catat Keuangan</span>
      <span>Sendiri atau Bareng</span>
    </div>
    <div
      style="display: flex; font-size: 24px; color: #94a3b8; margin-top: 20px; line-height: 1.4; max-width: 600px;"
    >
      Lacak pemasukan, pengeluaran, dan saldo — simpel, cepat, tanpa ribet.
    </div>
  </div>
</template>
