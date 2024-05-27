<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  data: { default: new ArrayBuffer(0), type: ArrayBuffer },
  columns: { default: 16, type: Number },
  rows: { default: 16, type: Number }
})
const startPos = ref(0);
const selStart = ref(0);
const selEnd = ref(0);

const offsetLength = computed(() => {
  if (props.data.byteLength < 0x10000) {
    return 4;
  }
  if (props.data.byteLength < 0x1000000) {
    return 6;
  }
  return 8;
});

const hexHeader = [...Array(16).keys()].map((i) => i.toString(16).toUpperCase().padStart(2));

function format_data(arraybuffer) {
  let array = Array.from(new Uint8Array(arraybuffer));
  array = array.map((it) => ({
    hex: it.toString(16).toUpperCase().padStart(2, "0"),
    ascii: (0x20 <= it && it <= 0x7e) ? String.fromCharCode(it) : '.',
  }));
  return array;
}
const dataLines = computed(() => {
  const l = [];
  let i, k;
  for (i=0, k=startPos.value; i<props.rows && k+props.columns<props.data.byteLength; i++, k+=props.columns) {
    l.push(format_data(props.data.slice(k, k+props.columns)));
  }
  const last = format_data(props.data.slice(k, k+props.columns));
  while (last.length < props.columns) {
    last.push({
      hex: "  ",
      ascii: " "
    });
  }
  l.push(last);
  while (l.length < props.rows) {
    l.push([]);
  }
  return l;
});

const offsets = computed(() => {
  const o = [];
  let k = startPos.value;
  for (let line of dataLines.value) {
    if (line.length == 0) {
      o.push(" ");
    } else {
      o.push(k.toString(16).toUpperCase().padStart(offsetLength.value, "0"));
      k += line.length;
    }
  }
  return o;
});


</script>

<template>
  <div class="hex-view">
    <div class="offset header">Addr</div>
    <div class="hex header line">
      <div class="hex-item" v-for="(item, index) in hexHeader" :key="index">{{ item }}</div>
    </div>
    <div class="ascii header line">ASCII</div>
    <div class="offset lines">
      <div class="offset-item" v-for="(offset, index) in offsets" :key="index">{{ offset }}</div>
    </div>
    <div class="hex lines">
      <div class="line" v-for="(line, index) in dataLines" :key="index">
        <div class="hex-item" v-for="(item, index) in line" :key="index">{{ item.hex }}</div>
      </div>
    </div>
    <div class="ascii lines">
      <div class="line" v-for="(line, index) in dataLines" :key="index">
        <div class="ascii-item" v-for="(item, index) in line" :key="index">{{ item.ascii }}</div>
      </div>
    </div>
    <div class="hex-view-footer">

    </div>
  </div>
</template>

<style scoped>
  .hex-view {
    font-family: monospace;
    white-space: pre-wrap;
    display: grid;
    grid-template-columns: repeat(3, min-content);
  }
  .header {
    border-bottom: 1px solid;
    margin-bottom: 0.2em;
    background-color: var(--color-background-soft);
  }
  
  .offset {
    padding-left: 0.5em;
    padding-right: 1em;
  }

  .hex {
    display: flex;
    flex-direction: column;
  }

  .line {
    display: flex;
    flex-direction: row;
  }

  .hex-item {
    padding-left: 0.25em;
    padding-right: 0.25em;
  }

  .ascii {
    padding-left: 1em;
    padding-right: 0.5em;
  }
</style>
