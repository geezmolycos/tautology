<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  clickable: {
    type: Boolean,
  },
});
const tryOpen = ref(false);
const isOpen = computed(() => {
  return props.clickable && tryOpen.value;
});
</script>

<template>
  <div :class="{'has-tooltip': true, open: isOpen, 'underline-clickable': clickable}">
    <span @click="tryOpen = !tryOpen"><slot></slot></span>
    <span class="tooltip"><slot name="tooltip"></slot></span>
  </div>
</template>

<style scoped>
.has-tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dashed;
  margin-bottom: -1px;
}

.has-tooltip.open {
  border-bottom-style: solid;
}

.has-tooltip .tooltip {
  visibility: hidden;
  display: block;
  padding: 0 0.5em;
  position: absolute;
  width: max-content;
  z-index: 1;
  top: 0;
  left: calc(100% + 0.5em);
  background-color: var(--color-background-soft);
}

.has-tooltip.open .tooltip {
  visibility: visible;
}

.has-tooltip:hover .tooltip {
  visibility: visible;
}

.underline-clickable {
  border-bottom-color: var(--color-clickable-accent);
}

</style>