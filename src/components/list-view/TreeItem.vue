<script setup>
import { ref } from 'vue'
const props = defineProps(['name', 'fullname', 'initialIsOpen'])

const isOpen = ref(props.initialIsOpen);

function toggle() {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <div class="tree-item-wrapper">
    <div @click="toggle" class="tree-item">
      <span>{{ isOpen ? "[-]" : "[+]"}}</span>
      <span>{{ isOpen ? name : (fullname || name) }}</span>
    </div>
    <div class="tree-item-inner" v-if="isOpen">
      <slot />
    </div>
  </div>
</template>

<style scoped>
  .tree-item-wrapper {
    user-select: none;
  }
</style>
