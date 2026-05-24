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
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #1a1a2e 100%);
      position: relative;
      overflow: hidden;
    "
  >
    <div
      style="
        position: absolute;
        top: -200px;
        right: -200px;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%);
      "
    />
    <div
      style="
        position: absolute;
        bottom: -100px;
        left: -100px;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
      "
    />
    <div style="font-size: 18px; color: #ef4444; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;">
      Finance App
    </div>
    <div style="font-size: 64px; color: #f1f5f9; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em;">
      Catat Keuangan<br>Sendiri atau Bareng
    </div>
    <div style="font-size: 24px; color: #94a3b8; margin-top: 20px; line-height: 1.4; max-width: 600px;">
      Lacak pemasukan, pengeluaran, dan saldo — simpel, cepat, tanpa ribet.
    </div>
    <div
      style="
        position: absolute;
        bottom: 80px;
        right: 80px;
        display: flex;
        align-items: center;
        gap: 12px;
      "
    >
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #22c55e;" />
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444;" />
      <div style="font-size: 16px; color: #64748b; font-weight: 500;">
        Aemy Finance
      </div>
    </div>
  </div>
</template>
