<script setup>
import TreeItem from './TreeItem.vue';
import HighlightTag from '../HighlightTag.vue';
import SymbolItem from './SymbolItem.vue';
import { ref, computed } from 'vue';
const props = defineProps(['symbols', 'begin', 'length', 'outBegin', 'outLength']);
const startPos = ref(0);
const itemsPerPage = 256;

const currentPageSymbols = computed(() => {
  return props.symbols.slice(startPos.value, startPos.value + itemsPerPage);
});

function changePage(n) {
  let newStart = startPos.value + itemsPerPage * n;
  newStart = Math.max(0, Math.min(newStart, props.symbols.length - 1));
  newStart = Math.floor(newStart / itemsPerPage) * itemsPerPage;
  startPos.value = newStart;
}

</script>

<template>
  <TreeItem>
    <template v-slot:summary>{{ symbols.length }} symbols
      <HighlightTag :begin="begin" :length="length" :out-begin="outBegin" :out-length="outLength"></HighlightTag>
    </template>
    <div v-if="symbols.length > itemsPerPage">
      <span class="clickable" @click="changePage(-1)">&lt;-</span>
      <span class="clickable" @click="changePage(+1)">-&gt;</span>
      Page {{ startPos / itemsPerPage + 1 }} / {{ Math.floor(symbols.length / itemsPerPage) + 1 }}
    </div>
    <SymbolItem v-for="(symbol, index) in currentPageSymbols" :key="index" :symbol="symbol" :begin="begin"></SymbolItem>
  </TreeItem>
</template>