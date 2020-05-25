<template>
    <div>
        <input type="file" ref="file" @change="onFileSelected">
    </div>
</template>
<script>
    export default {
        name: 'FileInput',
        methods: {
            onFileSelected() {
                const input = this.$refs.file
                const file = input.files[0]
                
                const fileURL = URL.createObjectURL(file)
                console.log(fileURL)
                this.$emit('input', fileURL)
            }
        }
    }
</script>
