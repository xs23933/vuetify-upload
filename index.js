'use strict'

import Upload from './components/Upload'

const VuetifyUpload = {
  install (Vue) {
    Vue.component('upload', Upload)
  }
}

export default VuetifyUpload