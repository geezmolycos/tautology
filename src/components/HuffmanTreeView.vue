<script setup>
import { computed } from 'vue';
const props = defineProps(['tree', 'symbolNames']);

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
          currentNode.value = code.slice(0, j);
        }
      }
      currentNode = currentNode[code[j]];
    }
    currentNode.value = code + ' ' + (symbolNames[i / 2] || (i / 2).toString());
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

</script>

<template>
  <pre><code>{{ drawTree2(false)(false)(treeToDraw) }}</code></pre>
</template>

<style scoped>
pre {
  font-family: monospace;
  line-height: 1;
}
</style>
