<script setup>
import TreeItem from './TreeItem.vue';
import HexView from '../HexView.vue';
import SymbolList from './SymbolList.vue';
import HighlightTag from '../HighlightTag.vue';
import HuffmanTreeMinimap from '../HuffmanTreeMinimap.vue';
import { ref, computed, provide, inject } from 'vue';
import UZIP from 'uzip';
import { literalLengthSymbols } from '../LiteralLengthDistanceSymbols.js';
const props = defineProps(['blockDetail']);

const treesCodeLengthsU8 = computed(() => {
  const totalLength = props.blockDetail.HLIT + props.blockDetail.HDIST;
  return new Uint8Array(props.blockDetail.trees_code_lengths.slice(0, totalLength));
})

const treeHex = ref();

const hlit2 = inject('hlit2');

function treeHlit2(begin, length, outBegin, outLength) {
  hlit2(begin, length);
  if (outBegin !== undefined) {
    treeHex.value.highlight(outBegin*8, (outBegin+outLength)*8, true);
  } else {
    treeHex.value.highlight(0, 0);
  }
}

provide('hlit2', treeHlit2);

const ordr = UZIP.F.U.ordr;
const codeLengthTreeSymbols = [...Array(16).keys()].map(x => x.toString()).concat(['dup2', 'zro3', 'zro7']);

</script>

<template>
  <div>Literal length tree: <HuffmanTreeMinimap :tree="blockDetail.literal_length_tree" :symbolNames="literalLengthSymbols" clickable></HuffmanTreeMinimap></div>
  <div>Distance tree: <HuffmanTreeMinimap :tree="blockDetail.distance_tree" :symbolNames="[]" clickable></HuffmanTreeMinimap></div>
  <TreeItem>
    <TreeItem>
      <template v-slot:summary><span>Code length tree: <HuffmanTreeMinimap :tree="blockDetail.code_length_tree" :symbolNames="codeLengthTreeSymbols" clickable></HuffmanTreeMinimap></span></template>
      <div>Code lengths for code length tree: (<HighlightTag :begin="blockDetail.begin + 13" :length="4">{{ blockDetail.HCLEN }}</HighlightTag>) <HighlightTag :begin="blockDetail.begin + 17" :length="blockDetail.HCLEN * 3"></HighlightTag></div>
      <table>
        <thead><tr><td v-for="(o, index) in ordr" :key="index">{{ codeLengthTreeSymbols[o] }}</td></tr></thead>
        <tbody><tr><td v-for="(i, index) in blockDetail.code_length_tree_code_lengths" :key="index"><HighlightTag :begin="blockDetail.begin + 17 + index*3" :length="3">{{ i }}</HighlightTag></td></tr></tbody>
      </table>
    </TreeItem>
    <template v-slot:summary>Code lengths
      (<HighlightTag :begin="blockDetail.begin + 3" :length="5">{{ blockDetail.HLIT }}</HighlightTag>,
      <HighlightTag :begin="blockDetail.begin + 8" :length="5">{{ blockDetail.HDIST }}</HighlightTag>)
    </template>
    <SymbolList :symbols="blockDetail.trees_detail.symbols"
      :begin="blockDetail.trees_detail.data_begin"
      :length="blockDetail.trees_detail.data_length"
      :out-begin="0"
      :out-length="treesCodeLengthsU8.byteLength"
      no-ascii></SymbolList>
    <HexView :data="treesCodeLengthsU8" hide-binary ref="treeHex" class="small"></HexView>
  </TreeItem>
  
</template>

<style scoped>
.small {
  font-size: 0.8em;
}
</style>