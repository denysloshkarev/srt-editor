import Vue from 'vue';
import {uuid} from "../utils/generators";

const state = () => ({
    subtitles: [],
})

const getters = {
    all(state) {
        return state.subtitles
    },
    filtered(state, getters, rootState) {
        const cursorPos = rootState.editor.cursorPos;
        return state.subtitles.filter(s => s.positionFrom <= cursorPos && s.positionTo >= cursorPos);
    }
}

const types = {
    SUBTITLES_SET: 'SUBTITLES_SET',
    SUBTITLES_SET_POSITION: 'SUBTITLES_SET_POSITION',
    SUBTITLES_FOCUS: 'SUBTITLES_FOCUS',
    SUBTITLES_CLEAR_FOCUS: 'SUBTITLES_CLEAR_FOCUS',
}

const mutations = {
    [types.SUBTITLES_SET]: (state, subtitles) => {
        state.subtitles = subtitles;
    },
    [types.SUBTITLES_FOCUS]: (state, {key, focus}) => {
        const subtitle = state.subtitles.find(s => s.key === key);
        Vue.set(subtitle, 'focused', focus);
    },
    [types.SUBTITLES_CLEAR_FOCUS]: (state) => {
        state.subtitles.forEach(subtitle => {
            Vue.set(subtitle, 'focused', false);
        })
    },
    [types.SUBTITLES_SET_POSITION]: (state, data) => {
        const { key, position } = data;
        const subtitle = state.subtitles.find(s => s.key === key);
        Vue.set(subtitle, 'positionFrom', position);
        Vue.set(subtitle, 'positionTo', position + subtitle.width);
    },
};

const actions = {
    importSRT({ commit, rootGetters }, text) {
        const {tlWidth, duration} = rootGetters['editor/metaData'];
        const subtitles = text.split('\n\n').map(subtitle => {
            const subArr = subtitle.split('\n');
            const times = subArr[1].split(' --> ').map(time => {
                const timeGroups = time.split(':')
                let seconds = parseInt(timeGroups[0], 10) * 3600; // hours
                seconds += parseInt(timeGroups[1], 10) * 60; // minutes
                seconds += parseFloat(timeGroups[2].replace(/\D/, '.')); // seconds
                return seconds
            });
            const positions = times.map(time => {
                return parseInt(time / duration * tlWidth, 10)
            });
            return {
                key: uuid(),
                id: subArr[0],
                timeFrom: times[0],
                timeTo: times[1],
                positionFrom: positions[0],
                positionTo: positions[1],
                width: positions[1] - positions[0],
                title: subArr[2],
                focused: false,
            }
        });
        commit(types.SUBTITLES_SET, subtitles);
    },
    setPosition({ commit }, data) {
        commit(types.SUBTITLES_SET_POSITION, data);
    },
    setFocus({ commit }, data) {
        commit(types.SUBTITLES_FOCUS, data);
    },
    clearFocus({ commit }) {
        commit(types.SUBTITLES_CLEAR_FOCUS);
    },
    resort({ commit, state }) {
        const sorted = state.subtitles.sort((a, b) => {
            if (a.positionFrom < b.positionFrom) return -1;
            if (a.positionFrom > b.positionFrom) return 1;
            return 0;
        });
        commit(types.SUBTITLES_SET, sorted);
    },
}

export default {
    state,
    mutations,
    actions,
    getters,
    namespaced: true,
}
