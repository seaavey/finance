<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { ChartConfig } from '../chart';
import { VisAxis, VisCrosshair, VisGroupedBar, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/vue';
import { ChartContainer, ChartTooltipContent } from '../chart';
import { componentToString } from '../chart/utils';

const props = withDefaults(
  defineProps<{
    data: any[];
    config: ChartConfig;
    index: string;
    categories: string[];
    class?: HTMLAttributes['class'];
    type?: 'grouped' | 'stacked';
    showXAxis?: boolean;
    showYAxis?: boolean;
    showGridLine?: boolean;
    showTooltip?: boolean;
    showLegend?: boolean;
    xFormatter?: (tick: string | number) => string;
    yFormatter?: (tick: string | number) => string;
  }>(),
  {
    type: 'grouped',
    showXAxis: true,
    showYAxis: true,
    showGridLine: true,
    showTooltip: true,
    showLegend: true,
  },
);

const x = (d: any) => d[props.index];
const y = props.categories.map((category) => (d: any) => d[category]);

const color = (d: any, i: number) => {
  const category = props.categories[i];
  return props.config[category]?.color || `var(--vis-color${i})`;
};
</script>

<template>
  <div :class="props.class">
    <ChartContainer :config="config">
      <VisXYContainer :data="data">
        <VisGroupedBar
          v-if="type === 'grouped'"
          :x="x"
          :y="y"
          :color="color"
          :rounded-corners="4"
        />
        <VisStackedBar
          v-else
          :x="x"
          :y="y"
          :color="color"
          :rounded-corners="4"
        />

        <VisAxis
          v-if="showXAxis"
          type="x"
          :grid-line="false"
          :tick-format="xFormatter"
        />
        <VisAxis
          v-if="showYAxis"
          type="y"
          :grid-line="showGridLine"
          :tick-format="yFormatter"
        />

        <VisCrosshair v-if="showTooltip" :template="componentToString(config, ChartTooltipContent)" />
        <VisTooltip v-if="showTooltip" />
      </VisXYContainer>
    </ChartContainer>
  </div>
</template>
