<script setup>
import ListView from './components/list-view/ListView.vue'
import DeflateRoot from './components/list-view/DeflateRoot.vue'
import HexView from './components/HexView.vue'
import { deflateRaw } from 'uzip'
import { inflate_detail } from './inflate_detail.js'
import { ref, watch } from 'vue'

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

const d = deflated;

const hex = ref();

watch(hex, (newHex, oldHex) => {
  newHex.highlight(1, 10, true);
});

</script>

<template>
  <div class="leftright">
    <ListView>
      <DeflateRoot :detail="detailRef"></DeflateRoot>
    </ListView>
    <HexView :data="d" ref="hex"></HexView>
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
