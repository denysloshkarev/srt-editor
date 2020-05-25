<template>
    <div class="home">
        <file-input @input="setVideoUrl" />
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
            })
        }
    }
</script>
