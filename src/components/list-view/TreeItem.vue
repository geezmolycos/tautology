<script setup>
import { ref } from 'vue';
const props = defineProps({
  initialIsOpen: {
    type: Boolean
  },
});

const isOpen = ref(props.initialIsOpen);

function toggle() {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <div class="tree-item-wrapper">
    <div @click.prevent="toggle" class="tree-item">
      <span class="clickable">{{ isOpen ? "[-]" : "[+]"}}</span>
      <slot name="summary"></slot>
    </div>
    <div class="tree-item-inner" v-if="isOpen">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
  .tree-item-inner {
    padding-left: 1em;
  }
</style>
