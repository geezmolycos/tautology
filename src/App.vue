<script setup>
import ListView from './components/list-view/ListView.vue'
import DeflateRoot from './components/list-view/DeflateRoot.vue'
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
</script>

<template>
  <ListView>
    <DeflateRoot :detail="detailRef"></DeflateRoot>
  </ListView>
</template>

<style scoped>

</style>
