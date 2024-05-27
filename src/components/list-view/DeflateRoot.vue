<script setup>
import TreeItem from './TreeItem.vue'
import Block from './Block.vue'
const props = defineProps(['detail'])

</script>

<template>
  <div class="deflate-root">
    <TreeItem name="Deflate stream" :fullname="'Deflate stream (' + detail.blocks.length + ' blocks)'">
      <Block v-for="block in detail.blocks" :block-detail="block" :key="block.begin"></Block>
    </TreeItem>
  </div>
</template>