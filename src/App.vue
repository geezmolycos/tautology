<script setup>
import ListView from './components/list-view/ListView.vue'
import DeflateRoot from './components/list-view/DeflateRoot.vue'
import HexView from './components/HexView.vue'
import { deflateRaw } from 'uzip'
import { inflate_detail } from './inflate_detail.js'
import { ref } from 'vue'

const str = `12345678924187967432017594852984152018941598520498602498718413174981074710180974891607418091074`;
const encoder = new TextEncoder();
const encodedArray = encoder.encode(str, {});
const deflated = deflateRaw(encodedArray, {level:9});
const detail = inflate_detail(deflated);
console.log(detail);

const decoder = new TextDecoder();
const decodedString = decoder.decode(detail.buf);
console.log(decodedString);
const detailRef = ref(detail);

const d = ref(new ArrayBuffer(120));
const arr = new Uint8Array(d.value);
const stringToAssign = "Hello, world!";
const e = new TextEncoder();
const encodedData = e.encode(stringToAssign);

arr.set(encodedData);
</script>

<template>
  <ListView>
    <DeflateRoot :detail="detailRef"></DeflateRoot>
  </ListView>
  <HexView :data="d"></HexView>
</template>

<style scoped>

</style>
