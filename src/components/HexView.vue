<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  data: { default: new Uint8Array(0), type: Uint8Array },
  columns: { default: 16, type: Number },
  rows: { default: 8, type: Number },
  hideBinary: { type: Boolean },
})
const startPos = ref(0);
const selStart = ref(0);
const selEnd = ref(140);

const dataLength = computed(() => {
  return props.data.byteLength;
})

const offsetLength = computed(() => {
  if (dataLength.value < 0x10000) {
    return 4;
  }
  if (dataLength.value < 0x1000000) {
    return 6;
  }
  return 8;
});

function formatOffset(offset) {
  return offset.toString(16).toUpperCase().padStart(offsetLength.value, "0");
}

const hexHeader = [...Array(16).keys()].map((i) => i.toString(16).toUpperCase().padStart(2));

function formatData(u8array, offset) {
  let array = Array.from(u8array);
  array = array.map((it, i) => ({
    hex: it.toString(16).toUpperCase().padStart(2, "0"),
    ascii: (0x20 <= it && it <= 0x7e) ? String.fromCharCode(it) : '.',
    offset: offset + i,
  }));
  return array;
}
const dataLines = computed(() => {
  const l = [];
  let i, k;
  for (i=0, k=startPos.value; i<props.rows && k+props.columns<dataLength.value; i++, k+=props.columns) {
    l.push(formatData(props.data.slice(k, k+props.columns), k));
  }
  const last = formatData(props.data.slice(k, k+props.columns), k);
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
      o.push(formatOffset(k) + ':');
      k += line.length;
    }
  }
  return o;
});

function selectionBackground(offset) {
  const bitOffsetBegin = offset * 8;
  const bitOffsetEnd = bitOffsetBegin + 8;
  if (selEnd.value <= bitOffsetBegin || bitOffsetEnd <= selStart.value) {
    // not contained
    return null;
  }
  if (selStart.value <= bitOffsetBegin && bitOffsetEnd <= selEnd.value) {
    // fully contained
    return 'var(--color-selected)';
  }
  // overlapped
  let startRatio = (selStart.value - bitOffsetBegin) / 8;
  startRatio = Math.max(0, startRatio);
  let endRatio = (selEnd.value - bitOffsetBegin) / 8;
  endRatio = Math.min(1, endRatio);
  return `linear-gradient(90deg,
    transparent ${startRatio * 100}%,
    var(--color-selected) ${startRatio * 100}%,
    var(--color-selected) ${endRatio * 100}%,
    transparent ${endRatio * 100}%)`;
}

function uint8ArrayToBinary(arr) {
  let binary = '';
  for (let i = 0; i < arr.length; i++) {
    binary += arr[i].toString(2).padStart(8, '0');
  }
  return binary;
}

function addSpaces(string, initial, interval, tail) {
  let result = '';
  let startIndex = initial;
  let chunk = string.slice(0, initial);
  result += chunk;

  while (tail ? (startIndex <= string.length) : (startIndex < string.length)) {
    let chunk = string.slice(startIndex, startIndex + interval);
    result += ' ' + chunk;
    startIndex += interval;
  }
  return result;
}

function getRangeBinary(data, showStart, showEnd, selStart, selEnd) {
  const showData = data.subarray(showStart, showEnd);
  const binary = uint8ArrayToBinary(showData);
  const selectionStartBits = selStart - showStart * 8;
  const selectionEndBits = selEnd - showStart * 8;
  if (selectionEndBits <= 0) {
    return [
      '', '', addSpaces(binary, 8, 8)
    ];
  }
  if (binary.length <= selectionStartBits) {
    return [
      addSpaces(binary, 8, 8), '', ''
    ];
  }
  const binaryBefore = binary.slice(0, selectionStartBits);
  const binarySelected = binary.slice(selectionStartBits, selectionEndBits);
  const binaryAfter = binary.slice(selectionEndBits);
  return [
    addSpaces(binaryBefore, 8, 8, true),
    addSpaces(binarySelected, (8 - selectionStartBits % 8), 8),
    addSpaces(binaryAfter, (8 - selectionEndBits % 8) % 8, 8),
  ];
}

const selectionBinary = computed(() => {
  const showStart = Math.max(0, Math.floor(selStart.value / 8) - 1);
  const showEnd = Math.min(dataLength.value, Math.ceil(selEnd.value / 8) + 1);
  if (showEnd - showStart <= 4) {
    return {
      firstLabel: formatOffset(showStart) + ':',
      firstLine: getRangeBinary(props.data, showStart, showEnd, selStart.value, selEnd.value)
    };
  } else if (showEnd - showStart <= 8) {
    const firstLine = getRangeBinary(props.data, showStart, showStart + 4, selStart.value, selEnd.value);
    const secondLine = getRangeBinary(props.data, showStart + 4, showEnd, selStart.value, selEnd.value);
    return {
      firstLabel: formatOffset(showStart) + ':',
      secondLabel: formatOffset(showStart + 4) + ':',
      firstLine: firstLine,
      secondLine: secondLine,
    };
  } else {
    const firstLine = getRangeBinary(props.data, showStart, showStart + 4, selStart.value, selEnd.value);
    const secondLine = getRangeBinary(props.data, showEnd - 4, showEnd, selStart.value, selEnd.value);
    return {
      firstLabel: formatOffset(showStart) + ':',
      secondLabel: '...',
      middleLabel: '...',
      finalLabel: ':' + formatOffset(showEnd + 4),
      firstLine: firstLine,
      secondLine: secondLine,
    };
  }
});

const rangeUnit = ref('byte');
const rangeBase = ref(16);

function move(lines) {
  const bytes = props.columns * lines;
  const target = startPos.value + bytes;
  if (target > dataLength.value) {
    startPos.value = Math.floor(dataLength.value / props.columns) * props.columns;
  } else if (target < 0) {
    startPos.value = 0;
  } else {
    startPos.value = target;
  }
}

function highlight(start, end, seek) {
  if (seek) {
    const displayStart = startPos.value;
    const diffLines = Math.floor((start - displayStart) / props.columns);
    if (diffLines < 0 || diffLines > props.rows) {
      move(diffLines);
    }
  }
  selStart.value = start;
  selEnd.value = end;
}

defineExpose({highlight});

</script>

<template>
  <div class="hex-view">
    <!--row 1-->
    <div class="offset header">{{ formatOffset(dataLength) }}</div>
    <div class="hex header line">
      <div class="hex-item" v-for="(item, index) in hexHeader" :key="index">{{ item }}</div>
    </div>
    <div class="ascii header line">ASCII
      <span class="clickable" @click="move(-4)">&lt;</span>
      <span class="clickable" @click="move(+4)">&gt;</span>
      <span class="clickable" @click="move(-16)">(</span>
      <span class="clickable" @click="move(+16)">)</span>
      <span class="clickable" @click="move(-256)">[</span>
      <span class="clickable" @click="move(+256)">]</span>
      <span class="clickable" @click="move(-4096)">{</span>
      <span class="clickable" @click="move(+4096)">}</span>
    </div>
    <!--row 2-->
    <div class="offset lines">
      <div class="offset-item" v-for="(offset, index) in offsets" :key="index">{{ offset }}</div>
    </div>
    <div class="hex lines">
      <div class="line" v-for="(line, index) in dataLines" :key="index">
        <div class="hex-item"
        :style="{background: selectionBackground(item.offset)}"
        v-for="(item, lineindex) in line" :key="lineindex">{{ item.hex }}</div>
      </div>
    </div>
    <div class="ascii lines">
      <div class="line" v-for="(line, index) in dataLines" :key="index">
        <div class="ascii-item"
        :style="{background: selectionBackground(item.offset)}"
        v-for="(item, lineindex) in line" :key="lineindex">{{ item.ascii }}</div>
      </div>
    </div>
    <!--row 3-->
    <template v-if="!hideBinary">
    <div class="offset header footer">Bin</div>
    <div class="hex header line footer">
      <div class="binary-selection"><span>0------7 8------F 10----17 18----1F</span></div>
    </div>
    <div class="ascii header footer">Range
      <span :class="{clickable: true, active: rangeUnit == 'byte'}" @click="rangeUnit = {bit: 'byte', byte: 'bit'}[rangeUnit]">Byte</span><!--
      -->&nbsp;<span :class="{clickable: true, active: rangeBase == 10}" @click="rangeBase = {10: 16, 16: 10}[rangeBase]">Dec</span>
    </div>
    <!--row 4-->
    <div class="label">{{ selectionBinary.firstLabel }}</div>
    <div class="binary-selection" v-if="selectionBinary.firstLine">
      {{ selectionBinary.firstLine[0] }}<span class="selected">{{ selectionBinary.firstLine[1] }}</span>{{ selectionBinary.firstLine[2] }}<!--
      --><span v-if="selectionBinary.middleLabel" :class="{'right-label': true, 'selected': selectionBinary.middleLabel == '...'}">{{ selectionBinary.middleLabel }}</span>
    </div>
    <div class="binary-selection" v-else></div>
    <div class="label" style="grid-row: 5;" v-if="selectionBinary.secondLabel" :class="{'label': true, 'selected': selectionBinary.secondLabel == '...'}">{{ selectionBinary.secondLabel }}</div>
    <div class="label" style="grid-row: 5;" v-else></div>
    <div class="binary-selection" style="grid-row: 5;" v-if="selectionBinary.secondLine">
      {{ selectionBinary.secondLine[0] }}<span class="selected">{{ selectionBinary.secondLine[1] }}</span>{{ selectionBinary.secondLine[2] }}<!--
      --><span v-if="selectionBinary.finalLabel" class="right-label">{{ selectionBinary.finalLabel }}</span>
    </div>
    <div class="binary-selection" style="grid-row: 5;" v-else></div>
    <div class="ascii">
      <div v-if="rangeUnit == 'bit'">{{ rangeBase == 16 ? '0x' : '' }}{{ selStart.toString(rangeBase).toUpperCase() }}</div>
      <div v-else-if="rangeUnit == 'byte'">{{ rangeBase == 16 ? '0x' : '' }}{{ Math.floor(selStart / 8).toString(rangeBase).toUpperCase() }}:{{ (selStart % 8).toString() }}</div>
    </div>
    <!--row 5-->
    <div class="ascii">
      <div v-if="rangeUnit == 'bit'">{{ rangeBase == 16 ? '0x' : '' }}{{ selEnd.toString(rangeBase).toUpperCase() }}</div>
      <div v-else-if="rangeUnit == 'byte'">{{ rangeBase == 16 ? '0x' : '' }}{{ Math.floor(selEnd / 8).toString(rangeBase).toUpperCase() }}:{{ (selEnd % 8).toString() }}</div>
    </div>
    </template>
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
  user-select: none;
}
.footer {
  border-top: 1px solid;
}

.offset {
  padding-left: 0.5em;
  padding-right: 1em;
  user-select: none;
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
  white-space: pre;
}

.ascii {
  padding-left: 1em;
  padding-right: 0.5em;
}

.ascii-item {
  white-space: pre;
}

.label {
  padding-left: 0.5em;
  padding-right: 1em;
  user-select: none;
}
.right-label {
  padding-left: 1em;
  padding-right: 0.5em;
  user-select: none;
}

.binary-selection :first-child {
  padding-left: 0.25em;
}
.binary-selection .selected {
  display: inline-block;
}

</style>
