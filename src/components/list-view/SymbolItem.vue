<script setup>
import { computed } from 'vue';
import HighlightTag from '../HighlightTag.vue';
import HasTooltip from '../HasTooltip.vue';

const props = defineProps(['symbol', 'begin']);

function toHex(i, pad) {
  return i.toString(16).toUpperCase().padStart(pad, "0");
}
function toBin(i, pad) {
  return i.toString(2).padStart(pad, "0");
}

const display = computed(() => {
  const it = props.symbol.value;
  return {
    hex: toHex(it, 2),
    ascii: (0x20 <= it && it <= 0x7e) ? String.fromCharCode(it) : '.',
    has_ascii: (0x20 <= it && it <= 0x7e),
    raw: toBin(props.symbol.raw, props.symbol.size),
  };
})
</script>

<template>
  <div v-if="symbol.type == 'lit'" class="lit">
    <HasTooltip>
      <HighlightTag :begin="begin + symbol.pos" :length="symbol.size" :out-begin="symbol.out" :out-length="1">
        <span v-if="display.has_ascii" class="ascii">{{ display.ascii }}</span>
        <span v-else class="hex">{{ display.hex }}</span>
      </HighlightTag>
      <template v-slot:tooltip>{{ display.raw }} -> 0x{{ display.hex }}</template>
    </HasTooltip>
  </div>
  <div v-else-if="symbol.type == 'rep'" class="rep">
    <HasTooltip>
      <HighlightTag :begin="begin + symbol.pos" :length="symbol.size + symbol.length_extra_size + symbol.distance_size + symbol.distance_extra_size"
        :out-begin="symbol.out - symbol.distance_base_value - symbol.distance_extra_value"
        :out-length="symbol.length_base_value + symbol.length_extra_value">
        (d{{ symbol.distance_base_value + symbol.distance_extra_value }}
      </HighlightTag>
      <HighlightTag :begin="begin + symbol.pos" :length="symbol.size + symbol.length_extra_size + symbol.distance_size + symbol.distance_extra_size"
        :out-begin="symbol.out" :out-length="symbol.length_base_value + symbol.length_extra_value">
        r{{ symbol.length_base_value + symbol.length_extra_value }})
      </HighlightTag>
      <template v-slot:tooltip>
        r {{ display.raw }} -> 0x{{ display.hex }}, length {{ symbol.length_base_value }}+{{ symbol.length_extra_value }}({{ symbol.length_extra_size }} bits)
        <br>d {{ toBin(symbol.distance_raw, symbol.distance_size) }} -> 0x{{ toHex(symbol.distance_value) }}, dist {{ symbol.distance_base_value }}+{{ symbol.distance_extra_value }}({{ symbol.distance_extra_size }} bits)
      </template>
    </HasTooltip>
  </div>
  <div v-else-if="symbol.type == 'end'">
    <HighlightTag :begin="begin + symbol.pos" :length="symbol.size">(end)</HighlightTag>
  </div>
</template>

<style scoped>
.lit {
  display: inline-block;
}
.rep {
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