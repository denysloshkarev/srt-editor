<template>
    <div class="editor">
        <div class="panel panel--row">
            <div class="panel main">
                <video v-show="videoUrl" ref="videoNode" :src="videoUrl" class="w-100" controls />
                <div class="video__mask">
                    <div class="video__subtitles">
                        <div v-for="(subtitle, index) in filteredSubtitles"
                             :key="index"
                             class="video__subtitle"
                        >
                            {{ subtitle.title }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="panel panel--column sidebar">
                <file-input read-type="text"
                            @input="onFileSelect"
                />
                <div v-for="(subtitle, index) in subtitles" :key="index">
                    {{ subtitle.title }}
                </div>
            </div>
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
                    
                    <div class="subtitles">
                        <vue-draggable-resizable v-for="(subtitle, index) in subtitles"
                                                 :key="index"
                                                 class-name="subtitle__wrapper"
                                                 :resizable="false"
                                                 :w="subtitle.width" :h="50"
                                                 :x="subtitle.positionFrom"
                                                 axis="x"
                                                 :onDrag="(x,y) => onSubtitleDrag(x, y, subtitle, index)"
                        >
                            <div class="subtitle"
                                 :style="{
                                        width: `${subtitle.width}px`,
                                        background: 'red',
                                     }"
                            >{{ subtitle.title }}
                            </div>
                        </vue-draggable-resizable>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import VueDraggableResizable from 'vue-draggable-resizable'
    import FileInput from "../components/FileInput";
    
    export default {
        components: {
            FileInput,
            VueDraggableResizable
        },
        computed: {
            ...mapGetters('editor', {
                isVideoSelected: 'isVideoSelected',
                editorMeta: 'metaData',
                editorCursorPos: 'cursorPos',
                videoUrl: 'videoUrl',
            }),
            ...mapGetters('subtitles', {
                subtitles: 'all',
                filteredSubtitles: 'filtered',
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
        watch: {
            isVideoSelected(isVideoSelected) {
                if (!isVideoSelected) this.$router.replace('/')
            }
        },
        mounted() {
            if (!this.isVideoSelected) this.$router.replace('/')
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
            ...mapActions('subtitles', {
                importSRT: 'importSRT',
                setSubtitlePosition: 'setPosition',
            }),
            onDrag(x) {
                if (x <= 0) return false;
                if (x >= this.editorMeta.tlWidth) return false;
                this.setVideoPosition(x);
                this.setVideoPositionTime(x);
            },
            onSubtitleDrag(x, y, subtitle, index) {
                if (x <= 0) return false;
                if (x >= this.editorMeta.tlWidth - subtitle.width) return false;
                this.setSubtitlePosition({
                    index, position: x
                });
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
            onFileSelect(text) {
                this.importSRT(text)
            }
        }
    }
</script>
