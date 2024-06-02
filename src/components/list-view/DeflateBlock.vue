<script setup>
import TreeItem from './TreeItem.vue';
import HighlightTag from '../HighlightTag.vue';
import { computed } from 'vue';
import SymbolList from './SymbolList.vue';
const props = defineProps(['blockDetail']);

const typeName = computed(() => {
  return {
    0: 'no compression',
    1: 'fixed huffman',
    2: 'dynamic huffman',
    3: 'error'
  }[props.blockDetail.BTYPE];
});

</script>

<template>
  <TreeItem>
    <template v-slot:summary>{{ typeName }} block
      <HighlightTag :begin="blockDetail.begin" :length="blockDetail.length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></HighlightTag>
    </template>
    <div>is {{ blockDetail.BFINAL ? '' : 'not' }} final</div>
    <template v-if="blockDetail.BTYPE == 0">
      <div>length: <HighlightTag :begin="blockDetail.body_begin" :length="16"></HighlightTag></div>
      <div>data: <HighlightTag :begin="blockDetail.data_begin" :length="blockDetail.data_length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></HighlightTag></div>
    </template>
    <template v-else-if="blockDetail.BTYPE == 1">
      <SymbolList :symbols="blockDetail.symbols" :begin="blockDetail.data_begin" :length="blockDetail.data_length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></SymbolList>
    </template>
    <template v-else-if="blockDetail.BTYPE == 2">
      <SymbolList :symbols="blockDetail.symbols" :begin="blockDetail.data_begin" :length="blockDetail.data_length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></SymbolList>
    </template>
  </TreeItem>
</template>