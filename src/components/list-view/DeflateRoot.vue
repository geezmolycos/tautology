<script setup>
import TreeItem from './TreeItem.vue';
import HighlightTag from './HighlightTag.vue';
import Block from './Block.vue';
import { provide } from 'vue';
const props = defineProps(['detail', 'hlit2']);

provide('hlit2', props.hlit2);

</script>

<template>
  <TreeItem initial-is-open>
    <template v-slot:summary>Deflate stream ({{ detail.blocks.length }} blocks)
      <HighlightTag :begin="detail.begin" :length="detail.length" :out-begin="detail.out_begin" :out-length="detail.out_length"></HighlightTag>
    </template>
    <Block v-for="block in detail.blocks" :block-detail="block" :key="block.begin" v-bind="$attrs"></Block>
  </TreeItem>
</template>