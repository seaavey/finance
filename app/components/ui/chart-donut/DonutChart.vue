<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { ChartConfig } from '@/app/components/ui/chart';
import { VisDonut, VisSingleContainer, VisTooltip } from '@unovis/vue';
import { ChartContainer, ChartTooltipContent } from '@/app/components/ui/chart';
import { componentToString } from '@/app/components/ui/chart/utils';

const props = withDefaults(
  defineProps<{
    data: any[];
    config: ChartConfig;
    index: string;
    category: string;
    class?: HTMLAttributes['class'];
    showTooltip?: boolean;
    showLegend?: boolean;
  }>(),
  {
    showTooltip: true,
    showLegend: true,
  },
);

const value = (d: any) => d[props.category];

const color = (d: any, i: number) => {
  const item = props.data[i];
  const key = item[props.index];
  return props.config[key]?.color || `var(--vis-color${i})`;
};
</script>

<template>
  <div :class="props.class">
    <ChartContainer :config="config">
      <VisSingleContainer :data="data">
        <VisDonut
          :value="value"
          :color="color"
          :arc-width="0.3"
          :show-labels="false"
        />

        <VisTooltip v-if="showTooltip" :template="componentToString(config, ChartTooltipContent)" />
      </VisSingleContainer>
    </ChartContainer>
  </div>
</template>
