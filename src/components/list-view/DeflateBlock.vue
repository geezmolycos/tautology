<script setup>
import TreeItem from './TreeItem.vue';
import HighlightTag from '../HighlightTag.vue';
import HuffmanTreeMinimap from '../HuffmanTreeMinimap.vue';
import SymbolList from './SymbolList.vue';
import { computed } from 'vue';
import UZIP from 'uzip';

const props = defineProps(['blockDetail']);

const typeName = computed(() => {
  return {
    0: 'no compression',
    1: 'fixed huffman',
    2: 'dynamic huffman',
    3: 'error'
  }[props.blockDetail.BTYPE];
});

const ordr = UZIP.F.U.ordr;
const codeLengthTreeSymbols = [...Array(16).keys()].map(x => x.toString()).concat(['rep2', 'rpz3', 'rpz7']);

</script>

<template>
  <TreeItem>
    <template v-slot:summary>{{ typeName }} block
      <HighlightTag :begin="blockDetail.begin" :length="blockDetail.length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></HighlightTag>
    </template>
    <div><HighlightTag :begin="blockDetail.begin" :length="1">is {{ blockDetail.BFINAL ? '' : 'not' }} final</HighlightTag></div>
    <template v-if="blockDetail.BTYPE == 0">
      <div>length: <HighlightTag :begin="blockDetail.body_begin" :length="16"></HighlightTag></div>
      <div>data: <HighlightTag :begin="blockDetail.data_begin" :length="blockDetail.data_length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></HighlightTag></div>
    </template>
    <template v-else-if="blockDetail.BTYPE == 1">
      <SymbolList :symbols="blockDetail.symbols" :begin="blockDetail.data_begin" :length="blockDetail.data_length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></SymbolList>
    </template>
    <template v-else-if="blockDetail.BTYPE == 2">
      Code length tree lengths: 
      <div>Code length tree: <HuffmanTreeMinimap :tree="blockDetail.code_length_tree" :symbolNames="[]" clickable></HuffmanTreeMinimap></div>
      <div>Literal length tree: <HuffmanTreeMinimap :tree="blockDetail.literal_length_tree" :symbolNames="[]" clickable></HuffmanTreeMinimap></div>
      <div>Distance tree: <HuffmanTreeMinimap :tree="blockDetail.distance_tree" :symbolNames="[]" clickable></HuffmanTreeMinimap></div>
      <SymbolList :symbols="blockDetail.symbols" :begin="blockDetail.data_begin" :length="blockDetail.data_length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></SymbolList>
    </template>
  </TreeItem>
</template>