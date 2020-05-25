<template>
    <div class="editor">
        <div class="panel panel--row">
            <div class="panel main">
                <video v-show="videoUrl" ref="videoNode" :src="videoUrl" class="w-100" controls />
            </div>
            <div class="panel panel--column sidebar"></div>
        </div>
        <div class="panel panel--row timeline">
            <div v-if="isVideoSelected"
                 class="grid__wrapper"
                 ref="gridWrapper"
            >
                <div class="grid__positioner"
                     ref="gridPositioner"
                >
                    <div class="grid" :style="gridStyles" @click="onGridClick"></div>
                    <vue-draggable-resizable class-name="cursor__wrapper"
                                             :resizable="false"
                                             :w="20" :h="30"
                                             :x="cursorPos"
                                             axis="x"
                                             :onDrag="onDrag"
                    >
                        <div class="cursor"></div>
                    </vue-draggable-resizable>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import VueDraggableResizable from 'vue-draggable-resizable'
    
    export default {
        components: {
            VueDraggableResizable
        },
        computed: {
            ...mapGetters('editor', {
                isVideoSelected: 'isVideoSelected',
                editorMeta: 'metaData',
                editorCursorPos: 'cursorPos',
                videoUrl: 'videoUrl',
            }),
            gridStyles() {
                if (!this.editorMeta) return {};
                const {tlWidth} = this.editorMeta;
                return {
                    width: tlWidth + 'px'
                }
            },
            cursorPos() {
                if (!this.editorCursorPos) return 0;
                return this.editorCursorPos;
            }
        },
        mounted() {
            this.$nextTick(() => {
                if (this.$refs.videoNode) {
                    this.$refs.videoNode.preload = "metadata"; // preload setting
                    this.$refs.videoNode.addEventListener("loadedmetadata", () => { // when enough data loads
                        const duration = this.$refs.videoNode.duration
                        this.setVideoMetaData({
                            duration
                        })
                    });
                    this.$refs.videoNode.addEventListener("playing", this.onVideoPlaying);
                    this.$refs.videoNode.addEventListener("ended", this.onVideoEnd);
                    this.$refs.videoNode.addEventListener("pause", this.onVideoEnd);
                }
            })
        },
        methods: {
            ...mapActions('editor', {
                setVideoMetaData: 'setMetaData',
                setVideoPosition: 'setPosition',
                startPlaying: 'startPlaying',
                stopPlaying: 'stopPlaying',
            }),
            onDrag(x) {
                if (x <= 0) return false;
                if (x >= this.editorMeta.tlWidth) return false;
                this.setVideoPosition(x);
                this.setVideoPositionTime(x);
            },
            onGridClick(event) {
                const pl = window.getComputedStyle(this.$refs.gridPositioner, null)
                    .getPropertyValue('padding-left');
                
                const position = this.$refs.gridWrapper.scrollLeft + event.x - parseInt(pl, 10);
                this.setVideoPosition(position);
                this.setVideoPositionTime(position);
            },
            setVideoPositionTime(position) {
                const {tlWidth, duration} = this.editorMeta;
                this.$refs.videoNode.currentTime = duration * position / tlWidth;
            },
            onVideoEnd() {
                this.stopPlaying();
            },
            onVideoPlaying() {
                this.startPlaying(this.$refs.videoNode);
            },
        }
    }
</script>
