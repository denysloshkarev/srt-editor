import Vue from "vue";

const state = () => ({
    metaData: null,
    videoUrl: null,
    cursorPos: 0,
    playInterval: null,
})

const getters = {
    metaData(state) {
        return state.metaData
    },
    videoUrl(state) {
        return state.videoUrl
    },
    isVideoSelected(state) {
        return !!state.videoUrl
    },
    cursorPos(state) {
        return state.cursorPos
    },
}

const types = {
    EDITOR_SET_META_DATA: 'EDITOR_SET_META_DATA',
    EDITOR_SET_URL: 'EDITOR_SET_URL',
    EDITOR_SET_POSITION: 'EDITOR_SET_POSITION',
}

const mutations = {
    [types.EDITOR_SET_META_DATA]: (state, payload) => {
        state.metaData = payload;
        Vue.set(state.metaData, 'tlWidth', Math.round(100 * (payload.duration || 0)));
    },
    [types.EDITOR_SET_URL]: (state, url) => {
        state.videoUrl = url
    },
    [types.EDITOR_SET_POSITION]: (state, position) => {
        state.cursorPos = position
    },
}

const actions = {
    setMetaData({commit}, meta) {
        commit(types.EDITOR_SET_META_DATA, meta)
    },
    setUrl({commit}, url) {
        commit(types.EDITOR_SET_URL, url)
    },
    setPosition({commit}, position) {
        commit(types.EDITOR_SET_POSITION, position)
    },
    startPlaying({commit, state}, node) {
        const {tlWidth, duration} = state.metaData;
        state.playInterval = setInterval(() => {
            const currentTime = node.currentTime;
            commit(types.EDITOR_SET_POSITION, currentTime / duration * tlWidth)
        }, 20)
    },
    stopPlaying({state}) {
        if (state.playInterval) {
            clearInterval(state.playInterval);
            state.playInterval = null;
        }
    },
}

export default {
    state,
    mutations,
    actions,
    getters,
    namespaced: true,
}
