<script setup>
import TreeItem from './TreeItem.vue';
import HighlightTag from './HighlightTag.vue';
import SymbolItem from './SymbolItem.vue';
import { computed } from 'vue';
const props = defineProps(['symbols', 'begin', 'length', 'outBegin', 'outLength']);

</script>

<template>
  <TreeItem>
    <template v-slot:summary>{{ symbols.length }} symbols
      <HighlightTag :begin="begin" :length="length" :out-begin="outBegin" :out-length="outLength"></HighlightTag>
    </template>
    <SymbolItem v-for="(symbol, index) in symbols" :key="index" :symbol="symbol" :begin="begin"></SymbolItem>
  </TreeItem>
</template>