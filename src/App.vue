<script setup>
import ListView from './components/list-view/ListView.vue';
import DeflateRoot from './components/list-view/DeflateRoot.vue';
import HexView from './components/HexView.vue';
import { deflateRaw } from 'uzip';
import { inflate_detail } from './inflate_detail.js';
import { ref, watch } from 'vue';

const text = ref('12345434t3w4edr434t3w');
const level = ref(9);
const deflated = ref(new Uint8Array(1));

const detailRef = ref({blocks: [], begin: 0, length: 0, out_begin: 0, out_length: 0});

function updateCompress() {
  const encoder = new TextEncoder();
  const encodedArray = encoder.encode(text.value, {});
  deflated.value = deflateRaw(encodedArray, {level:parseInt(level.value)});
  const detail = inflate_detail(deflated.value);
  console.log(detail);
  detailRef.value = detail;

  const decoder = new TextDecoder();
  const decodedString = decoder.decode(detail.buf);
  console.log(decodedString);
}

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
  <textarea rows="8" style="width: 100%;" v-model="text"></textarea>
  Level:<textarea rows="1" style="width: 100%;" v-model="level"></textarea>
  <div><button style="width: 100%; height: 2em;" @click="updateCompress">Compress</button></div>
  <br>
  <div class="leftright">
    <ListView>
      <DeflateRoot :detail="detailRef" :hlit2="hlit2"></DeflateRoot>
    </ListView>
    <div>
      <div>Deflated:</div>
      <HexView :data="deflated" ref="hex" :rows="4" sel-little-endian flipped></HexView>
      <div>Inflated:</div>
      <HexView :data="detailRef.buf" ref="hexOut" hide-binary></HexView>
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
