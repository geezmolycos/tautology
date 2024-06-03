<script setup>
import { computed } from 'vue';
import HighlightTag from '../HighlightTag.vue';
import HasTooltip from '../HasTooltip.vue';

const props = defineProps(['symbol', 'begin', 'noAscii']);

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
    ascii: (0x21 <= it && it <= 0x7e) ? String.fromCharCode(it) : '.',
    has_ascii: (0x21 <= it && it <= 0x7e) && !props.noAscii,
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
        :out-length="symbol.length_base_value + symbol.length_extra_value"
        class="rep-dr">
        (&lt;{{ symbol.distance_base_value + symbol.distance_extra_value }}
      </HighlightTag>
      <HighlightTag :begin="begin + symbol.pos" :length="symbol.size + symbol.length_extra_size + symbol.distance_size + symbol.distance_extra_size"
        :out-begin="symbol.out" :out-length="symbol.length_base_value + symbol.length_extra_value"
        class="rep-dr">
        &gt;{{ symbol.length_base_value + symbol.length_extra_value }})
      </HighlightTag>
      <template v-slot:tooltip>
        copy {{ display.raw }} -> 0x{{ display.hex }}, length {{ symbol.length_base_value }}+{{ symbol.length_extra_value }}({{ symbol.length_extra_size }} bits)
        <br>dist {{ toBin(symbol.distance_raw, symbol.distance_size) }} -> 0x{{ toHex(symbol.distance_value) }}, dist {{ symbol.distance_base_value }}+{{ symbol.distance_extra_value }}({{ symbol.distance_extra_size }} bits)
      </template>
    </HasTooltip>
  </div>
  <div v-else-if="symbol.type == 'dup'" class="dup">
    <HasTooltip>
      <HighlightTag :begin="begin + symbol.pos" :length="symbol.size + symbol.length_extra_size"
        :out-begin="symbol.out"
        :out-length="symbol.length_base_value + symbol.length_extra_value"
        class="rep-dr">
        (&lt;x{{ symbol.length_base_value + symbol.length_extra_value }})
      </HighlightTag>
      <template v-slot:tooltip>
        dup {{ display.raw }} -> 0x{{ display.hex }}, length {{ symbol.length_base_value }}+{{ symbol.length_extra_value }}({{ symbol.length_extra_size }} bits)
      </template>
    </HasTooltip>
  </div>
  <div v-else-if="symbol.type == 'zro'" class="zro">
    <HasTooltip>
      <HighlightTag :begin="begin + symbol.pos" :length="symbol.size + symbol.length_extra_size"
        :out-begin="symbol.out"
        :out-length="symbol.length_base_value + symbol.length_extra_value"
        class="rep-dr">
        (00x{{ symbol.length_base_value + symbol.length_extra_value }})
      </HighlightTag>
      <template v-slot:tooltip>
        zero {{ display.raw }} -> 0x{{ display.hex }}, length {{ symbol.length_base_value }}+{{ symbol.length_extra_value }}({{ symbol.length_extra_size }} bits)
      </template>
    </HasTooltip>
  </div>
  <div v-else-if="symbol.type == 'end'">
    <HighlightTag :begin="begin + symbol.pos" :length="symbol.size">(end)</HighlightTag>
  </div>
  <div v-else>
    <HighlightTag :begin="begin + symbol.pos" :length="symbol.size">(unknown)</HighlightTag>
  </div>
</template>

<style scoped>
.lit, .rep, .dup, .zro {
  display: inline-block;
}
.ascii {
  padding: 0 0.25em;
}
.hex {
  font-size: 0.8em;
  padding: 0 0.25em;
}
.rep-dr {
  font-size: 0.8em;
}

</style>