<script setup>
import { computed } from 'vue';
import HighlightTag from './HighlightTag.vue';
import HasTooltip from '../HasTooltip.vue';

const props = defineProps(['symbol', 'begin']);

const display = computed(() => {
  const it = props.symbol.value;
  return {
    hex: it.toString(16).toUpperCase().padStart(2, "0"),
    ascii: (0x20 <= it && it <= 0x7e) ? String.fromCharCode(it) : '.',
    has_ascii: (0x20 <= it && it <= 0x7e),
    raw: props.symbol.raw.toString(2).padStart(props.symbol.size, "0")
  };
})
</script>

<template>
  <div v-if="symbol.type == 'lit'" class="literal">
  <HasTooltip>
    <HighlightTag :begin="begin + symbol.pos" :length="symbol.size" :out-begin="symbol.out" :out-length="1">
      <span v-if="display.has_ascii" class="ascii">{{ display.ascii }}</span>
      <span v-else class="hex">{{ display.hex }}</span>
    </HighlightTag>
    <template v-slot:tooltip>{{ display.raw }} -> 0x{{ display.hex }}</template>
  </HasTooltip>
  </div>
  <div v-else-if="symbol.type == 'end'">
    <HighlightTag :begin="begin + symbol.pos" :length="symbol.size">(end)</HighlightTag>
  </div>
</template>

<style scoped>
.literal {
  display: inline-block;
}
.ascii {
  font-size: 1.25em;
  margin: 0 0.25em;
}
.hex {
  font-size: 0.7em;
  margin: 0 0.25em;
}

</style>