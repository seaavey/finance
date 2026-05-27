<script setup lang="ts">
defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    siteUrl?: string;
  }>(),
  {
    title: 'Finance',
    description: 'Catat keuangan sendiri atau bareng pasangan. Simpel, cepat, tanpa ribet.',
    siteUrl: 'seaavey.site',
  },
);

const primary = '#c2410c';
</script>

<template>
  <div
    style="
      display: flex;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0c0c1a 0%, #1a0c0a 100%);
      padding: 64px;
    "
  >
    <div
      style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        text-align: center;
        gap: 32px;
      "
    >
      <div style="display: flex; align-items: center; gap: 20px">
        <div
          style="
            width: 56px;
            height: 56px;
            border-radius: 14px;
            background: #c2410c;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
            <path
              d="M2 17l10 5 10-5"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
            <path
              d="M2 12l10 5 10-5"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <span
          style="
            font-size: 56px;
            font-weight: 800;
            color: white;
            letter-spacing: -0.03em;
            line-height: 1;
            font-family: Inter, sans-serif;
          "
        >
          {{ title }}
        </span>
      </div>

      <div style="width: 80px; height: 4px; border-radius: 2px; background: #c2410c" />

      <p
        style="
          font-size: 22px;
          color: #a0a0b0;
          max-width: 640px;
          line-height: 1.5;
          font-family: Inter, sans-serif;
        "
      >
        {{ description }}
      </p>

      <div style="display: flex; gap: 12px; margin-top: 8px">
        <div
          style="width: 64px; height: 3px; border-radius: 2px; background: #c2410c; opacity: 0.4"
        />
        <div
          style="width: 32px; height: 3px; border-radius: 2px; background: #c2410c; opacity: 0.25"
        />
      </div>

      <div style="font-size: 14px; color: #666; font-family: Inter, sans-serif; margin-top: 8px">
        {{ siteUrl }}
      </div>
    </div>
  </div>
</template>
