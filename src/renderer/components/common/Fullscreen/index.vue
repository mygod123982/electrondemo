<template>
    <div @click="toggle" title="全屏/退出全屏" >
        <icon :name="isFull ? 'minimize' : 'maximize'"></icon>
        <slot></slot>
    </div>
</template>

<script>
    import {
        toggleFullscreen, isFullscreen
    } from '@/utils/fullscreen'

    export default {
        props: {
            refer: [Element, String], // string: element id
        },
        data() {
            return {
                isFull: false,
                ele: null,
            }
        },
        mounted() {
            this.element = this.refer instanceof Element ? this.refer : document.getElementById(this.refer)

            if (this.userAgent.browser.safari && !!this.referinner) {
                this.element = this.referinner instanceof Element ? this.referinner : document.getElementById(this.referinner)
            }
        },
        methods: {
            toggle() {
                this.isFull = toggleFullscreen(this.element)

                this.$emit('changed', this.isFull);
            },

            isFullscreen() {
                return isFullscreen(this.element);
            }
        }
    }
</script>