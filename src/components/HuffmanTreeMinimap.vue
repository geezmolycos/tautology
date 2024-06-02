<script setup>
import HasTooltip from './HasTooltip.vue';
import { ref, computed, watch, onMounted } from 'vue';
const props = defineProps(['tree', 'symbolNames']);

const itemCount = computed(() => {
  return props.tree.filter((e, i) => i % 2 == 1).map((e) => e != 0 ? 1 : 0).reduce((a, b) => a + b);
});

// tree format is [code, length, code, length, ...]
// for a symbol, tree[symbol*2] is code, tree[symbol*2+1] is length
function binaryTreeFromArray(arr, symbolNames) {
  const tree = {};
  for (let i = 0; i < arr.length; i += 2) {
    const code = arr[i].toString(2).padStart(arr[i + 1], '0');
    let currentNode = tree;
    for (let j = 0; j < code.length; j++) {
      if (!currentNode[code[j]]) {
        currentNode[code[j]] = {};
        if (j == 0) {
          currentNode.value = '*';
        } else {
          currentNode.value = code.slice(0, j).split('').reverse().join('');
        }
      }
      currentNode = currentNode[code[j]];
    }
    currentNode.value = code.split('').reverse().join('') + ' ' + (symbolNames[i / 2] || (i / 2).toString());
  }
  return convertTreeToObject(tree);
}

function convertTreeToObject(tree) {
  if (!tree) return null;
  const children = [];
  if (tree['0']) { children.push(convertTreeToObject(tree['0'])); }
  if (tree['1']) { children.push(convertTreeToObject(tree['1'])); }
  return window.drawTree2Node(tree.value, children);
}

const treeToDraw = computed(() => {
  return binaryTreeFromArray(props.tree, props.symbolNames);
});

const drawTree2 = window.drawTree2;

const treeText = computed(() => {
  return drawTree2(false)(true)(treeToDraw.value);
});

const minimapHeight = 96;
const minimapCharDrawMinHeight = 1;
const minimapCharDrawMinWidth = 2;
const minimapCharRatio = 0.5;

const minimap = ref();

function update_minimap(str) {
  const canvas = minimap.value;
  // Set the canvas dimensions based on the string
  const lines = str.split('\n');
  const rows = lines.length;
  const cols = Math.max(...lines.map(line => line.length));
  const charY = minimapHeight / rows;
  const charX = charY * minimapCharRatio;
  const charW = Math.max(minimapCharDrawMinWidth, charX);
  const charH = Math.max(minimapCharDrawMinHeight, charY);
  const bgColor = getComputedStyle(canvas).getPropertyValue("--color-background");
  const fgColor = getComputedStyle(canvas).getPropertyValue("--color-text");
  
  const minimapWidth = Math.floor(charX * cols);
  canvas.width = minimapWidth;
  canvas.height = minimapHeight;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  for (const [row, line] of lines.entries()) {
    for (const [col, char] of line.split("").entries()) {
      const y = row * charY;
      const x = col * charX;
      if (char === ' ' && (line[col-1] == ' ' || line[col+1] == ' ')) {
        // remove small gaps
        // do nothing
      } else {
        ctx.fillStyle = fgColor;
        ctx.fillRect(x, y, charW, charH);
      }
    }
  }
}

watch(treeText, (newValue, oldValue) => {
  update_minimap(newValue);
});

onMounted(() => {
  update_minimap(treeText.value);
});

</script>

<template>
  <HasTooltip>
    <div class="container">
      <div style="padding-right: 0.5em;">{{ itemCount }} symbols</div>
      <canvas ref="minimap"></canvas>
    </div>
    <template v-slot:tooltip><pre><code>{{ treeText }}</code></pre></template>
  </HasTooltip>
</template>

<style scoped>
pre {
  line-height: 1;
  white-space: pre;
}
.container {
  display: flex;
  align-items: center;
}
canvas {
  height: 24px;
}
</style>
