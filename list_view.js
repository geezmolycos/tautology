Vue.component('tree-item', {
    template: `
        <div class="tree-item-wrapper">
            <div @click="toggle" class="tree-item">
                <span>{{ isOpen ? "[-]" : "[+]"}}</span>
                <span>{{ isOpen ? name : (fullname || name) }}</span>
            </div>
            <div class="tree-item-inner" v-if="isOpen">
                <slot />
            </div>
        </div>
    `,
    props: ['name', 'fullname', 'initialIsOpen'],
    data() {
        return {
            isOpen: this.initialIsOpen,
        };
    },
    methods: {
        toggle() {
            this.isOpen = !this.isOpen;
        }
    }
});
Vue.component('deflate-root', {
    template: `
        <div class="deflate-root">
            <tree-item name="Deflate stream" :fullname="name">
                <deflate-block v-for="block in detail.blocks" :detail="block" :key="block.begin"></deflate-block>
            </tree-item>
        </div>
    `,
    props: ['detail'],
    data() {
        return {
            isOpen: false
        };
    },
    computed: {
        name() { return "Deflate stream (" + this.detail.blocks.length + " blocks)"; },
    },
    methods: {
        toggle() {
            this.isOpen = !this.isOpen;
        }
    }
});
Vue.component('deflate-block', {
    template: `
        <div class="deflate-block">
            <tree-item name="Block" :fullname="name">
                
            </tree-item>
        </div>
    `,
    props: ['detail'],
    data() {
        return {
            isOpen: false
        };
    },
    computed: {
        name() { return "Block"; },
    },
    methods: {
        toggle() {
            this.isOpen = !this.isOpen;
        }
    }
});