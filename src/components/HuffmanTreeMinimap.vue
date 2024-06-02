<script setup>
import HuffmanTreeView from './HuffmanTreeView.vue';
import HasTooltip from './HasTooltip.vue';
import { ref } from 'vue';
const props = defineProps(['huffmanAttrs']);

const treeHTML = ref();
const treeScale = ref(1);
const minimapWrapper = ref();

function updated(vnode) {
  console.log('updated', vnode);
  const element = vnode.el;
  const { width: cw, height: ch } = element.getBoundingClientRect();
  const { width: ww, height: wh } = minimapWrapper.value.getBoundingClientRect();
  const scale = Math.min(ww / cw, wh / ch);
  treeScale.value = scale;
  treeHTML.value = element.outerHTML;
}

</script>

<template>
  <HasTooltip>
    minimap:
    <div class="minimap-wrapper" ref="minimapWrapper">
      <div class="minimap-container" :style="{transform: `scale(${treeScale}, ${treeScale})`}" v-html="treeHTML" ref="huffContainer"></div>
    </div>
    <template v-slot:tooltip><HuffmanTreeView v-bind="huffmanAttrs" @vue:mounted="updated" @vue:updated="updated"></HuffmanTreeView></template>
  </HasTooltip>
</template>

<style scoped>
.minimap-wrapper {
  display: block;
  width: 8em;
  height: 8em;
}
.minimap-container {
  width: max-content;
  height: max-content;
  transform-origin: top left;
}

</style>
