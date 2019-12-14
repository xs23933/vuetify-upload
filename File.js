class File {
  constructor(file) {
    this._file = file
    this.status = file.status
    this.bytesSent = file.upload.bytesSent || 0
    this.process = file.upload.process || 0
    this.total = file.upload.total
    this.type = file.type
    this.size = file.size
    this.dataUrl = ''
    this.xhrResponse = {}
    this.customAttributes = {}
    this.errorMessage = ''
  }

  updateDataUrl (payload) {
    this.dataUrl = payload
  }

  updateStatus (payload) {
    this.status = payload
  }

  updateProcess (payload) {
    this.process = payload
  }

  updateBytesSent (payload) {
    this.bytesSent = payload
  }

  updateXhrResponse (payload) {
    this.xhrResponse = payload
  }

  updateErrorMessage (payload) {
    this.errorMessage = payload
  }

  addAtrribute (k, v) {
    this.customAttributes[k] = v
  }

}

export default File