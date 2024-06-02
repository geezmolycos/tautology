<script setup>
import { inject } from 'vue';
const props = defineProps(['begin', 'length', 'outBegin', 'outLength']);

const hlit2 = inject('hlit2');

function formatOffset(bit) {
  return bit.toString(16).toUpperCase();
}
</script>

<template>
  <span class="highlight" @click.stop.prevent="hlit2(begin, length, outBegin, outLength)">
    <slot>{{ formatOffset(begin) }}+{{ formatOffset(length) }}<template v-if="outBegin !== undefined">-&gt;{{ formatOffset(outBegin) }}+{{ formatOffset(outLength) }}</template></slot>
  </span>
</template>
