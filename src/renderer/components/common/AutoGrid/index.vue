<template>
    <div id="grid-container" class="grid-container">
        <div id="auto-grid" :style="{
                height: grid.height + 'px',
                width: grid.width + 'px',
                gridTemplateColumns: 'repeat(' + grid.columns + ', 1fr)',
                gridTemplateRows: 'repeat(' + grid.rows + ', 1fr)',
            }">
            <slot></slot>
        </div>
    </div>

</template>

<script>
    import ResizeObserver from 'resize-observer-polyfill'
    
    export default {
        props: {
            itemRatio: {
                type: Number,
                default: 4 / 3
            },
            itemCount: {
                type: Number,
                default: 0
            },
            focused: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            itemCount: function () {
                this.setOptimalGrid()
            },
            focused: function () {
                this.setOptimalGrid()
            }
        },
        data() {
            return {
                grid: {
                    height: 0,
                    width: 0,
                    columns: 1,
                    rows: 1,
                }
            };
        },
        mounted() {
            this.container = document.getElementById('grid-container')
            this.gridEle = document.getElementById('auto-grid')

            this.handleResize();
            // window.addEventListener('resize', this.handleResize.bind(this), false);

            const resizeObserver = new ResizeObserver(this.throttle(this.handleResize.bind(this), 500, {leading: true, trailing: true}));
            resizeObserver.observe(document.getElementById('grid-container'));
        },
        methods: {
            handleResize() {
                const now = Date.now();
                if (!this.pre) this.pre = now;

                console.log('interval: ', now - this.pre)
                this.pre = now;

                if (!this.ticking) {
                    window.requestAnimationFrame(() => {
                        this.ticking = false;
                        this.setOptimalGrid();
                    });
                }
                this.ticking = true;
            },

            setOptimalGrid() {

                let itemCount = this.itemCount;
                if (itemCount < 1 || !this.container || !this.grid) {
                    return;
                }

                const {
                    width: canvasWidth,
                    height: canvasHeight
                } = this.container.getBoundingClientRect();

                const gridGutter = parseInt(window.getComputedStyle(this.gridEle)
                    .getPropertyValue('grid-row-gap'), 10) || 10;
                const hasFocusedItem = itemCount > 2 && this.focused;
                // Has a focused item so we need +3 cells
                if (hasFocusedItem) {
                    itemCount += 3;
                }

                const possibleCols = [];
                for (let i = 1; i <= itemCount; i++) {
                    possibleCols.push(i);
                }

                const optimalGrid = possibleCols.reduce((currentGrid, col) => {
                    const testGrid = this.findOptimalGrid(
                        canvasWidth, canvasHeight, gridGutter,
                        this.itemRatio, itemCount, col,
                    );
                    // We need a minimun of 2 rows and columns for the focused
                    const focusedConstraint = hasFocusedItem ? testGrid.rows > 1 && testGrid.columns > 1 : true;
                    const betterThanCurrent = testGrid.filledArea > currentGrid.filledArea;
                    return focusedConstraint && betterThanCurrent ? testGrid : currentGrid;
                }, {
                    filledArea: 0
                });

                this.grid = optimalGrid
            },

            findOptimalGrid(canvasWidth, canvasHeight, gutter, aspectRatio, numItems, columns = 1) {
                const rows = Math.ceil(numItems / columns);
                const gutterTotalWidth = (columns - 1) * gutter;
                const gutterTotalHeight = (rows - 1) * gutter;
                const usableWidth = canvasWidth - gutterTotalWidth;
                const usableHeight = canvasHeight - gutterTotalHeight;
                let cellWidth = Math.floor(usableWidth / columns);
                let cellHeight = Math.ceil(cellWidth / aspectRatio);
                if ((cellHeight * rows) > usableHeight) {
                    cellHeight = Math.floor(usableHeight / rows);
                    cellWidth = Math.ceil(cellHeight * aspectRatio);
                }
                return {
                    columns,
                    rows,
                    width: (cellWidth * columns) + gutterTotalWidth,
                    height: (cellHeight * rows) + gutterTotalHeight,
                    filledArea: (cellWidth * cellHeight) * numItems,
                };
            },


            throttle(func, wait, options) {
                var timeout, context, args, result;
                var previous = 0;
                if (!options) options = {};

                var now = () => {
                    return Date.now() || new Date().getTime();
                }

                var later = function () {
                    previous = options.leading === false ? 0 : now();
                    timeout = null;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                };

                var throttled = function () {
                    var _now = now();
                    if (!previous && options.leading === false) previous = _now;
                    var remaining = wait - (_now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0 || remaining > wait) {
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = null;
                        }
                        previous = _now;
                        result = func.apply(context, args);
                        if (!timeout) context = args = null;
                    } else if (!timeout && options.trailing !== false) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };

                throttled.cancel = function () {
                    clearTimeout(timeout);
                    previous = 0;
                    timeout = context = args = null;
                };

                return throttled;
            }
        }
    };
</script>

<style lang="scss" scoped>
    .grid-container {

        display: flex;
        align-items: center;
        justify-content: center;

        width: 100%;
        height: 100%;

        #auto-grid {
            display: grid;
            border-radius: 5px;

            grid-auto-flow: dense;
            grid-gap: 5px;

            align-items: center;
            justify-content: center;

            .grid-item {
                overflow: hidden;
                width: 100%;
                height: 100%;
                max-height: 100%;

                &.focused {
                    grid-column: 1 / span 2;
                    grid-row: 1 / span 2;
                }
            }
        }


    }
</style>