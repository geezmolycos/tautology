<script setup>
import { ref, computed, watch } from 'vue';
const props = defineProps({
  data: { default: new Uint8Array(0), type: Uint8Array },
  columns: { default: 16, type: Number },
  rows: { default: 8, type: Number },
  hideBinary: { type: Boolean },
  selLittleEndian: {type: Boolean},
  flipped: {type: Boolean},
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
  for (i=0, k=startPos.value; i<(props.rows - 1) && k+props.columns<dataLength.value; i++, k+=props.columns) {
    l.push(formatData(props.data.slice(k, k+props.columns), k));
  }
  const last = formatData(props.data.slice(k, k+props.columns), k);
  while (last.length < props.columns) {
    last.push({
      hex: "  ",
      ascii: " ",
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
      o.push("");
    } else {
      o.push(formatOffset(k));
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
  let endRatio = (selEnd.value - bitOffsetBegin) / 8;
  if (props.selLittleEndian) {
    [startRatio, endRatio] = [1 - endRatio, 1 - startRatio];
  }
  startRatio = Math.max(0, startRatio);
  endRatio = Math.min(1, endRatio);
  return `linear-gradient(90deg,
    transparent ${startRatio * 100}%,
    var(--color-selected) ${startRatio * 100}%,
    var(--color-selected) ${endRatio * 100}%,
    transparent ${endRatio * 100}%)`;
}

const binaryHeader = ['7------0', 'F------8', '17----10', '1F----18'];

function getByteBinary(position) {
  const value = props.data[position];
  const binary = value.toString(2).padStart(8, '0');
  if (selEnd.value <= position * 8) {
    return [binary, '', ''];
  }
  if (selStart.value >= position * 8 + 8) {
    return ['', '', binary];
  }
  const start = 8 - Math.min(8, selEnd.value - position * 8);
  const end = 8 - Math.max(0, selStart.value - position * 8);
  return [binary.slice(0, start), binary.slice(start, end), binary.slice(end, 8)];
}

const binaryLines = computed(() => {
  const showStart = Math.max(0, Math.floor(selStart.value / 8) - 1);
  const showEnd = Math.min(dataLength.value, Math.ceil(selEnd.value / 8) + 1);
  if (showEnd - showStart <= 16) {
    const lines = [[]];
    for (let i = showStart; i < showEnd; i++) {
      if (lines[lines.length - 1].length >= 4) {
        lines.push([]);
      }
      lines[lines.length - 1].push(getByteBinary(i));
    }
    return lines;
  } else {
    const lines = [[]];
    let i = showStart;
    while (i < showEnd) {
      if (lines[lines.length - 1].length >= 4) {
        lines.push([]);
      }
      lines[lines.length - 1].push(getByteBinary(i));
      i++;
      if (i == showStart + 8) {
        i = showEnd - 8;
      }
    }
    return lines;
  }
});

const binaryOffsets = computed(() => {
  const showStart = Math.max(0, Math.floor(selStart.value / 8) - 1);
  const showEnd = Math.min(dataLength.value, Math.ceil(selEnd.value / 8) + 1);
  const rows = Math.ceil((showEnd - showStart) / 4);
  if (rows <= 4) {
    return [[...Array(rows).keys()].map(x => formatOffset(showStart + x * 4))];
  }
  return [
    [formatOffset(showStart), '', '...', ''],
    ['', '...', '', formatOffset(showEnd)],
  ]
})

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
    const diffLines = Math.floor((start / 8 - displayStart) / props.columns);
    if (diffLines < 0) {
      move(diffLines);
    } else if (diffLines >= props.rows) {
      move(diffLines - props.rows + 1);
    }
  }
  selStart.value = start;
  selEnd.value = end;
}

const showGoto = ref(false);
const gotoInput = ref('');

function moveTo(newStartPos) {
  newStartPos = Math.floor(newStartPos / props.columns) * props.columns;
  newStartPos = Math.max(0, Math.min(dataLength.value, newStartPos));
  startPos.value = newStartPos;
}

watch(showGoto, (newValue, oldValue) => {
  if (newValue) {
    gotoInput.value = formatOffset(startPos.value);
  } else {
    moveTo(parseInt(gotoInput.value, 16));
  }
});

defineExpose({highlight});

</script>

<template>
  <div class="hex-view">
    <div class="hex-ascii-part">
      <div v-if="!flipped" class="offset header">{{ formatOffset(dataLength) }}</div>
      <div v-else class="placeholder header"></div>
      <div :class="{hex: true, header: true, line: true, flipped: flipped}">
        <div class="hex-item" v-for="(item, index) in hexHeader" :key="index">{{ item }}</div>
      </div>
      <div v-if="flipped" class="offset header" style="text-align: right;">{{ formatOffset(dataLength) }}</div>
      <div v-else class="placeholder header"></div>
      <div class="ascii header">
        <span class="clickable" :class="{active: showGoto}" @click="showGoto = !showGoto">Goto</span><!--
        -->&nbsp;<span v-show="!showGoto">
          <span class="clickable" @click="move(-16)">-4</span>
          <span class="clickable" @click="move(-4)">-1</span>
          <span class="clickable" @click="move(+4)">+1</span>
          <span class="clickable" @click="move(+16)">+4</span>
        </span>
        <span v-show="showGoto">
          <input type="text" :style="{width: Math.min(8, (offsetLength + 2)).toString() + 'ch'}" @focus="$event.target.select()" v-model="gotoInput">
        </span>
      </div>
      <div v-if="!flipped" class="offset lines">
        <div class="offset-item" v-for="(offset, index) in offsets" :key="index">{{ offset !== '' ? offset + ':' : ' ' }}</div>
      </div>
      <div v-else class="placeholder"></div>
      <div class="hex lines">
        <div :class="{line: true, flipped: flipped}" v-for="(line, index) in dataLines" :key="index">
          <div class="hex-item"
          :style="{background: selectionBackground(item.offset)}"
          v-for="(item, lineindex) in line" :key="lineindex">{{ item.hex }}</div>
        </div>
      </div>
      <div v-if="flipped" class="offset lines">
        <div class="offset-item" v-for="(offset, index) in offsets" :key="index">{{ offset !== '' ? ':' + offset : ' ' }}</div>
      </div>
      <div v-else class="placeholder"></div>
      <div class="ascii lines">
        <div :class="{line: true, flipped: flipped}" v-for="(line, index) in dataLines" :key="index">
          <div class="ascii-item"
          :style="{background: selectionBackground(item.offset)}"
          v-for="(item, lineindex) in line" :key="lineindex">{{ item.ascii }}</div>
        </div>
      </div>
    </div>
    <div v-if="!hideBinary" class="binary-part">
      <div class="header footer" style="text-align: left;">{{ flipped ? '' : 'Bin' }}</div>
      <div class="line header footer" :class="{flipped: flipped}">
        <div class="binary-item"
          v-for="(item, lineindex) in binaryHeader" :key="lineindex"><span>{{ item }}</span>
        </div>
      </div>
      <div class="header footer" style="text-align: right;">{{ flipped ? 'Bin' : '' }}</div>
      <div class="lines" style="grid-row: 2; align-items: flex-end;">
        <div class="binary-offset-item" v-for="(item, index) in binaryOffsets[flipped ? 1 : 0]" :key="index" :class="{selected: item == '...'}">
          {{ item !== '' ? item + ':' : ' ' }}
        </div>
      </div>
      <div class="lines" style="grid-row: 2;">
        <div :class="{line: true, flipped: flipped}" v-for="(line, index) in binaryLines" :key="index">
          <div class="binary-item"
          v-for="(item, lineindex) in line" :key="lineindex">
            <span v-if="item[0]">{{ item[0] }}</span><span class="selected">{{ item[1] }}</span><span v-if="item[2]">{{ item[2] }}</span>
          </div>
        </div>
      </div>
      <div class="lines" style="grid-row: 2;  align-items: flex-start;">
        <div class="binary-offset-item" v-for="(item, index) in binaryOffsets[flipped ? 0 : 1]" :key="index" :class="{selected: item == '...'}">
          {{ item !== '' ? ':' + item : ' ' }}
        </div>
      </div>
      <div class="ascii header footer" style="grid-column: 4;">Range
        <span :class="{clickable: true, active: rangeUnit == 'byte'}" @click="rangeUnit = {bit: 'byte', byte: 'bit'}[rangeUnit]">Byte</span><!--
        -->&nbsp;<span :class="{clickable: true, active: rangeBase == 10}" @click="rangeBase = {10: 16, 16: 10}[rangeBase]">Dec</span>
      </div>
      <div class="ascii" style="grid-column: 4;">
        <div v-if="rangeUnit == 'bit'">{{ rangeBase == 16 ? '0x' : '' }}{{ selStart.toString(rangeBase).toUpperCase() }}</div>
        <div v-else-if="rangeUnit == 'byte'">{{ rangeBase == 16 ? '0x' : '' }}{{ Math.floor(selStart / 8).toString(rangeBase).toUpperCase() }}:{{ (selStart % 8).toString() }}</div>
        <div v-if="rangeUnit == 'bit'">{{ rangeBase == 16 ? '0x' : '' }}{{ selEnd.toString(rangeBase).toUpperCase() }}</div>
        <div v-else-if="rangeUnit == 'byte'">{{ rangeBase == 16 ? '0x' : '' }}{{ Math.floor(selEnd / 8).toString(rangeBase).toUpperCase() }}:{{ (selEnd % 8).toString() }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hex-view {
  font-family: monospace;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
  width: min-content;
}
.hex-ascii-part {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.binary-part {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr max-content;
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

.lines {
  display: flex;
  flex-direction: column;
}

.line {
  display: flex;
  flex-direction: row;
}

.line.flipped {
  flex-direction: row-reverse;
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

.binary-item {
  white-space: pre;
  display: inline-block;
}

.binary-item > :first-child {
  padding-left: 0.25em;
}

.binary-item > :last-child {
  padding-right: 0.25em;
}

.binary-item .selected {
  display: inline-block;
}

.binary-offset-item {
  padding: 0 0.5em;
}

.binary-offset-item.selected {
  padding: 0;
  width: fit-content;
}

</style>
