<script setup>
import ListView from './components/list-view/ListView.vue';
import DeflateRoot from './components/list-view/DeflateRoot.vue';
import HexView from './components/HexView.vue';
import { deflateRaw } from 'uzip';
import { inflate_detail } from './inflate_detail.js';
import { ref, watch } from 'vue';

const str = `\x00\x00\ 3w9i85qr 4v32q v084roy7f932w jqkoiy897403yv jq89 v6i v6i   v6i  v6i v6ia  vs632w jqkoiy8974032w jqkoiy89740i v6i   v6 i v32w jqkoi3w4tw3ty4w3eyt543ery54r3eygh5rf4esyhz54rey8974032w jqkoiy897406i  32w jqkoiy89740  32w jqkoiy8974032w jqkoiy8974032w jqkoiy8974032w jqkoiy89740`;
// const str = `12345434t3w4edr434t3w`;
const encoder = new TextEncoder();
const encodedArray = encoder.encode(str, {});
const deflated = deflateRaw(encodedArray, {level:9});
const detail = inflate_detail(deflated);
console.log(detail);

const decoder = new TextDecoder();
const decodedString = decoder.decode(detail.buf);
console.log(decodedString);
const detailRef = ref(detail);

const hex = ref();
const hexOut = ref();

function hlit2(begin, length, outBegin, outLength) {
  hex.value.highlight(begin, begin+length, true);
  if (outBegin !== undefined) {
    hexOut.value.highlight(outBegin*8, (outBegin+outLength)*8, true);
  } else {
    hexOut.value.highlight(0, 0);
  }
}

</script>

<template>
  <div class="leftright">
    <ListView>
      <DeflateRoot :detail="detailRef" :hlit2="hlit2"></DeflateRoot>
    </ListView>
    <div>
      <div>Deflated:</div>
      <HexView :data="deflated" ref="hex" :rows="4" sel-little-endian flipped></HexView>
      <div>Inflated:</div>
      <HexView :data="detail.buf" ref="hexOut" hide-binary></HexView>
    </div>
  </div>
</template>

<style scoped>
.leftright {
  display: flex;
  flex-direction: row;
}

.leftright > * {
  flex: 1;
}

</style>
