<template>
    <div class="subtitle__wrapper" :class="{focused: data.focused}"
         @click.stop="onSubtitleTouch"
    >
        <div class="subtitle panel panel--row">
            <div class="subtitle__times">
                <input class="form-control"
                       :class="{edit: editMode}"
                       v-model="data.timeFrom"
                >
                <input class="form-control"
                       :class="{edit: editMode}"
                       v-model="data.timeTo"
                >
            </div>
            <div class="panel flex-grow-1">
                <textarea v-model="data.title" ref="title"></textarea>
            </div>
        </div>
    </div>
</template>
<script>
    import {mapActions} from "vuex";

    export default {
        name: 'Subtitle',
        props: {
            data: {
                type: Object,
                required: true,
            }
        },
        data() {
            return {
                editMode: false
            }
        },
        watch: {
            ['data.focused'](focused) {
                if (focused) {
                    this.$refs.title.focus();
                }
            }
        },
        methods: {
            ...mapActions('subtitles', {
                subtitlesSetFocus: 'setFocus',
                subtitlesClearFocus: 'clearFocus',
            }),
            onSubtitleTouch() {
                this.subtitlesClearFocus();
                this.subtitlesSetFocus({
                    key: this.data.key,
                    focus: true,
                })
            },
        }
    }
</script>
