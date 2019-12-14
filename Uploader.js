import Dropzone from 'dropzone'

Dropzone.autoDiscover = false

class Uploader {
  constructor(options) {
    this._options = options || {}
    this._existingInit = this._options.init || function () { }
    this._hooks = []
    this._uploader = null
  }

  _bindHooks (self) {
    self._existingInit.bind(this)()
    self._hooks.forEach(hook => {
      this.on(hook.event, hook.callback)
    })
    self._hooks = []
  }

  mount (domElem) {
    const self = this
    this._options.init = function () {
      self._bindHooks.bind(this)(self)
    }
    this._uploader = new Dropzone(domElem, this._options)
  }

  on (event, callback) {
    this._hooks.push({ event, callback })
  }

  destory () {
    this._uploader.disable()
  }

  removeFile (file) {
    this._uploader.removeFile(file)
  }

  addFile (file) {
    this._uploader.addFile(file)
  }

  removeAllFiles (cancelQueued) {
    this._uploader.removeAllFiles(cancelQueued)
  }

}

export default Uploader