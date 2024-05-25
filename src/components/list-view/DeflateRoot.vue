<script setup>
import TreeItem from './TreeItem.vue'
const props = defineProps(['detail'])

</script>

<template>
  <div class="deflate-root">
    <TreeItem name="Deflate stream" :fullname="'Deflate stream (' + detail.blocks.length + ' blocks)'">
      <div v-for="block in detail.blocks" :detail="block" :key="block.begin"> 1</div>
    </TreeItem>
  </div>
</template>