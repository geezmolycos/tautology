<script setup>
import TreeItem from './TreeItem.vue'
const props = defineProps(['blockDetail'])

</script>

<template>
  <div>
    BFINAL: {{ blockDetail.BFINAL }}
  </div>
</template>