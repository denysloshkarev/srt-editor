<template>
    <div class="home">
        <file-input read-type="blobUrl"
                    @input="onFileSelect"
        />
    </div>
</template>

<script>
    
    import FileInput from "../components/FileInput";
    import {mapActions} from "vuex";
    
    export default {
        name: 'VideoSelector',
        components: {
            FileInput
        },
        methods: {
            ...mapActions('editor', {
                setVideoUrl: 'setUrl'
            }),
            onFileSelect(url) {
                this.setVideoUrl(url);
                this.$router.push({name: 'SRTEditor'})
            }
        }
    }
</script>
