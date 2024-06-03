<script setup>
import TreeItem from './TreeItem.vue';
import HighlightTag from '../HighlightTag.vue';
import SymbolList from './SymbolList.vue';
import LiteralLengthDistance from './LiteralLengthDistance.vue';
import HuffmanTreeMinimap from '../HuffmanTreeMinimap.vue';
import { computed } from 'vue';
import UZIP from 'uzip';
import { literalLengthSymbols } from '../LiteralLengthDistanceSymbols.js';

console.log(UZIP);

const fixed_literal_length_tree = UZIP.F.U.fltree;
const fixed_distance_tree = UZIP.F.U.fdtree;

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
    <template v-slot:summary><HighlightTag :begin="blockDetail.begin + 1" :length="2">{{ typeName }}</HighlightTag> block
      <HighlightTag :begin="blockDetail.begin" :length="blockDetail.length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></HighlightTag>
    </template>
    <div><HighlightTag :begin="blockDetail.begin" :length="1">is {{ blockDetail.BFINAL ? '' : 'not' }} final</HighlightTag></div>
    <template v-if="blockDetail.BTYPE == 0">
      <div>length: <HighlightTag :begin="blockDetail.body_begin" :length="16"></HighlightTag></div>
      <div>data: <HighlightTag :begin="blockDetail.data_begin" :length="blockDetail.data_length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></HighlightTag></div>
    </template>
    <template v-else-if="blockDetail.BTYPE == 1">
      <div>Literal length tree: <HuffmanTreeMinimap :tree="fixed_literal_length_tree" :symbolNames="literalLengthSymbols" clickable></HuffmanTreeMinimap></div>
      <div>Distance tree: <HuffmanTreeMinimap :tree="fixed_distance_tree" :symbolNames="[]" clickable></HuffmanTreeMinimap></div>
      <SymbolList :symbols="blockDetail.symbols" :begin="blockDetail.data_begin" :length="blockDetail.data_length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></SymbolList>
    </template>
    <template v-else-if="blockDetail.BTYPE == 2">
      <LiteralLengthDistance :block-detail="blockDetail"></LiteralLengthDistance>
      <SymbolList :symbols="blockDetail.symbols" :begin="blockDetail.data_begin" :length="blockDetail.data_length" :out-begin="blockDetail.out_begin" :out-length="blockDetail.out_length"></SymbolList>
    </template>
  </TreeItem>
</template>