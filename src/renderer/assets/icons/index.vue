<template>
    <svg v-if="useSvg" :class="svgClass" :style="style" aria-hidden="true" @mousedown.stop>
        <use :xlink:href="iconName"></use>
    </svg>
    <i v-else class="iconfont" :class="iconName"></i>
</template>

<script>
    export default {
        name: 'Icon',
        props: {
            type: {
                type: String,
                default: 'svg'
            },
            name: {
                type: String,
                default: '',
                required: true
            },
            className: {
                type: String,
                default: ''
            },
            size: {
                type: [Number, String]
            },
            color: {
                type: String
            }
        },
        computed: {
            iconName() {
                let hash = this.type === 'svg' ? '#' : ''
                return `${hash}icon-${this.name}`
            },
            useSvg() {
                let type = this.type
                return type === 'svg'
            },
            svgClass() {
                if (this.className) {
                    return 'icon ' + this.className
                } else {
                    return 'icon'
                }
            },
            style() {
                const style = {
                    fontSize: this.size + 'px'
                }
                if (this.color) style.color = this.color
                return style
            },
            fontSize() {
                return `${this.size}px;`
            }
        }
    }
</script>

<style scoped>
    .icon {
        width: 1em;
        height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
    }
</style>