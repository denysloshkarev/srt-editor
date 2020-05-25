<template>
    <div>
        <input type="file" ref="file" @change="onFileSelected">
    </div>
</template>
<script>
    export default {
        name: 'FileInput',
        props: {
            readType: {
                type: String,
                default: 'text'
            }
        },
        methods: {
            onFileSelected() {
                const input = this.$refs.file;
                const file = input.files[0];
                
                switch (this.readType) {
                    case 'blobUrl': {
                        const fileURL = URL.createObjectURL(file);
                        this.$emit('input', fileURL);
                        break;
                    }
                    case 'text': {
                        const reader = new FileReader();
                        reader.readAsText(file, "UTF-8");
                        reader.onload = (evt) => {
                            this.$emit('input', evt.target.result);
                        }
                        reader.onerror = () => {
                            console.warn('onerror');
                        }
                        break;
                    }
                }
            }
        }
    }
</script>
