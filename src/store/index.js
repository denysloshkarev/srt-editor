import Vue from 'vue'
import Vuex from 'vuex'

import editor from './editor'
import subtitles from './subtitles'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    editor,
    subtitles,
  }
})
