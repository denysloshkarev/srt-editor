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
                <Subtitle v-for="subtitle in subtitles"
                          :key="subtitle.key"
                          :data="subtitle"
                />
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
                        <vue-draggable-resizable v-for="subtitle in subtitles"
                                                 :key="subtitle.key"
                                                 class-name="subtitle__wrapper"
                                                 class-name-active="bordered"
                                                 :resizable="false"
                                                 :w="subtitle.width" :h="50"
                                                 :x="subtitle.positionFrom"
                                                 axis="x"
                                                 :onDrag="(x,y) => onSubtitleDrag(x, y, subtitle)"
                        >
                            <div class="subtitle"
                                 :style="{
                                        width: `${subtitle.width}px`,
                                     }"
                                 @mouseup="onSubtitleMouseUp"
                                 @click.stop="onSubtitleTouch(subtitle)"
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
    import Subtitle from "../components/Subtitle";
    
    export default {
        components: {
            Subtitle,
            FileInput,
            VueDraggableResizable
        },
        computed: {
            ...mapGetters('editor', {
                isVideoSelected: 'isVideoSelected',
                isVideoPlaying: 'isVideoPlaying',
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
            },
            editorCursorPos(position) {
                if (!this.isVideoPlaying) return;
                const center = parseInt(window.innerWidth / 2);
                const cursorWindowPosition = position - this.$refs.gridWrapper.scrollLeft;
                if (cursorWindowPosition > center || (this.$refs.gridWrapper.scrollLeft && cursorWindowPosition !== center)) {
                    this.$refs.gridWrapper.scrollLeft += cursorWindowPosition - center;
                }
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
            document.addEventListener('click', this.onDocumentClick);
            document.addEventListener('touch', this.onDocumentClick);
        },
        beforeDestroy() {
            document.removeEventListener('click', this.onDocumentClick);
            document.removeEventListener('touch', this.onDocumentClick);
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
                subtitlesSort: 'resort',
                subtitlesSetFocus: 'setFocus',
                subtitlesClearFocus: 'clearFocus',
            }),
            onDocumentClick() {
                this.subtitlesClearFocus();
            },
            onDrag(x) {
                if (x <= 0) return false;
                if (x >= this.editorMeta.tlWidth) return false;
                this.setVideoPosition(x);
                this.setVideoPositionTime(x);
            },
            onSubtitleDrag(x, y, subtitle) {
                if (x <= 0) return false;
                if (x >= this.editorMeta.tlWidth - subtitle.width) return false;
                this.setSubtitlePosition({
                    key: subtitle.key, position: x
                });
            },
            onSubtitleMouseUp() {
                this.subtitlesSort();
            },
            onSubtitleTouch(subtitle) {
                this.subtitlesClearFocus();
                this.subtitlesSetFocus({
                    key: subtitle.key,
                    focus: true,
                })
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
