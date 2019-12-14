<template>
  <div v-bind:class="uploaderClass">
    <div class="up-preview mr-2"
         v-for="(item, idx) in files"
         :key="`preview${idx}`">
      <template v-if="item.status == 'success'">
        <!-- <template v-if="false"> -->
        <!-- 是图片 -->
        <template v-if="item.dataUrl.search(/(png|jpg|jpeg|gif)/i) != -1">
          <v-img :src="`${url}${item.dataUrl}`" />
          <div class="upload-list-cover">
            <v-icon size="24"
                    color="green"
                    @click="showPreview(`${url}${item.dataUrl}`)">mdi-eye-circle</v-icon>
            <v-icon size="24"
                    v-if="!item.lock"
                    @click="delImage(item)"
                    color="red">mdi-delete-circle</v-icon>
          </div>
        </template>
        <a :href="`${url}${item.dataUrl}`"
           target="_blank"
           v-else>下载</a>
      </template>
      <template v-else>
        <!-- 上传中 -->
        <v-progress-linear color="lime darken-1"
                           height="20"
                           :value="item.process"
                           striped></v-progress-linear>
      </template>
    </div>
    <div ref="up-preview"
         class="up-preview"
         style="display: none;">
      <div>
      </div>
    </div>
    <div class="up-btn">
      <v-icon size="48">mdi-cloud-upload</v-icon>
    </div>
    <v-dialog v-model="previewDlg"
              max-width="1000">
      <v-img :src="previewUrl" />
    </v-dialog>
  </div>
</template>

<script>
import Uploader from '../Uploader'
import File from '../File'

function guid () {
  function S4 () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
export default {
  props: {
    value: {
      type: String,
      default: () => "[]"
    },
    paramName: {
      type: String,
      default: () => "file"
    },
    token: {
      type: String,
      default: () => ""
    },
    url: {
      type: String,
      default: () => ""
    },
    action: {
      type: String,
      default: () => "/api/up"
    },
    uploaderClass: {
      type: String,
      default: () => "uploader"
    },
    onInit: {
      type: Function,
      default: () => () => { }
    },
    onAddedFile: {
      type: Function,
      default: () => () => { }
    },
    onRemovedFile: {
      type: Function,
      default: () => () => { }
    },
    onSending: {
      type: Function,
      default: () => () => { }
    },
    onDragEnter: {
      type: Function,
      default: () => () => { }
    },
    onDragLeave: {
      type: Function,
      default: () => () => { }
    },
    onDrop: {
      type: Function,
      default: () => () => { }
    },
    onTotalProgress: {
      type: Function,
      default: () => () => { }
    },
    onQueueComplete: {
      type: Function,
      default: () => () => { }
    },
    onMaxFiles: {
      type: Function,
      default: () => () => { }
    },
    onComplete: {
      type: Function,
      default: () => () => { }
    },
  },
  model: {
    prop: "value",
    event: "update"
  },
  data () {
    return {
      previewDlg: false,
      previewUrl: "",
      files: [],
      dragCounter: 0,
      loading: false,
      options: {
        url: '/up',
      },
      uploader: null
    }
  },
  mounted () {
    const options = JSON.parse(JSON.stringify(this.options))
    options.paramName = this.paramName
    const accept = options.accept || function (file, done) { done() }
    options.url = this.action ? `${this.url}${this.action}` : options.url

    if (this.token) {
      options.headers = {
        Authorization: 'Bearer ' + this.token
      }
    }


    options.previewTemplate = this.$refs['up-preview'].innerHTML
    options.accept = ({ blobId }, done) => {
      accept(this.getFile(blobId), done)
    }

    this.uploader = new Uploader(options)

    this.bindEvents()
    this.uploader.mount(this.$el.querySelector('.up-btn>i'))
    this.onInit(this)
    try {
      JSON.parse(this.value).forEach(e => {
        e.status = "success"
        e.dataUrl = e.url
        e.lock = true
        e.blobId = guid()
        e._file = e
        this.files.push(e)
      })
    } catch (e) { }
  },
  methods: {
    showPreview (url) {
      this.previewUrl = '' + url;
      this.previewDlg = true;
    },
    emitData () {
      let files = []
      this.files.forEach(img => {
        if (img.status == 'success') {
          let str = ""
          if (img.lock) {
            str = { name: img.name, url: img.url }
          } else {
            str = JSON.parse(img.xhrResponse.responseText)
          }
          files.push(str)
        }
      })
      this.$emit("update", JSON.stringify(files))
    },
    delImage (img) {
      this.files.forEach((e, i) => {
        if (e._file.blobId == img._file.blobId) {
          this.files.splice(i, 1)
          return false
        }
      })
      this.emitData()
    },
    bindEvents () {
      this.uploader.on('addedfile', this.addedFile.bind(this))
      this.uploader.on('sending', this.sending.bind(this))
      this.uploader.on('complete', this.complete.bind(this))
      this.uploader.on('error', this.error.bind(this))
      this.uploader.on('uploadprogress', this.uploadProgress.bind(this))
      this.uploader.on('thumbnail', this.thumbnail.bind(this))
      this.uploader.on('drop', this.drop.bind(this))
      this.uploader.on('dragenter', this.dragEnter.bind(this))
      this.uploader.on('dragleave', this.dragLeave.bind(this))
      this.uploader.on('totaluploadprogress', this.totalUploadProgress.bind(this))
      this.uploader.on('queuecomplete', this.queueComplete.bind(this))
    },
    getFile (blobId) {
      let matchedFile = {}
      this.files.forEach(file => {
        if (file._file.blobId === blobId) {
          matchedFile = file
          return false
        }
      })
      return matchedFile
    },
    addedFile (file) {
      const fileId = guid()
      file.blobId = fileId
      this.files.push(new File(file))
      this.onAddedFile(this.getFile(fileId))
    },

    sending ({ blobId }, xhr, formData) {
      const fileInstance = this.getFile(blobId)
      this.onSending(fileInstance, xhr, formData)
      this.loading = true
    },

    complete ({ blobId, status, xhr = {} }) {
      const fileInstance = this.getFile(blobId)
      fileInstance.updateStatus(status)
      let data = JSON.parse(xhr.responseText)
      fileInstance.updateDataUrl(data.url)
      fileInstance.updateXhrResponse({
        response: xhr.response,
        responseText: xhr.responseText,
        statusCode: xhr.status
      })
      this.loading = false
      this.emitData()
      this.onComplete(fileInstance, status, xhr)
    },

    error ({ blobId, status }, errorMessage) {
      const fileInstance = this.getFile(blobId)
      fileInstance.updateStatus(status)
      fileInstance.updateErrorMessage(errorMessage)
    },

    uploadProgress ({ blobId }, process, bytesSent) {
      const fileInstance = this.getFile(blobId)
      fileInstance.updateProcess(process)
      fileInstance.updateBytesSent(bytesSent)
    },

    thumbnail ({ blobId }, dataUrl) {
      const fileInstance = this.getFile(blobId)
      fileInstance.updateDataUrl(dataUrl)
    },

    drop () {
      this.dragCounter = 0
      this.onDrop()
      this.onDragLeave()
    },

    dragEnter (event) {
      event.preventDefault()
      this.dragCounter++
      this.onDragEnter()
    },

    dragLeave () {
      this.dragCounter--
      if (this.dragCounter === 0) {
        this.onDragLeave()
      }
    },

    totalUploadProgress (...args) {
      this.onTotalProgress(...args)
    },

    queueComplete () {
      this.onQueueComplete()
    },

    removeFile (file) {
      this.uploader.removeFile(file._file)
    },

    addFile (file) {
      this.uploader.addFile(file)
    },

    removeAllFiles (cancelQueued) {
      this.uploader.removeAllFiles(cancelQueued)
    },

    cleanupMessage (message) {
      return message.replace(/{{\s*?(\w+)\s*?}}/g, (match, group) => `{{${group}}}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.uploader {
  display: table;
  border-spacing: 5px;
  .up-btn {
    width: 70px;
    height: 70px;
    border: 1px dashed #999;
    vertical-align: middle;
    display: table-cell;
    align-content: center;
    padding: 9px;
    border-radius: 5px;
  }
  .up-preview {
    background: #fff;
    width: 70px;
    height: 70px;
    border: 1px solid #999;
    border-radius: 5px;
    padding: 4px;
    display: table-cell;
    position: relative;
    vertical-align: middle;
    .upload-list-cover {
      display: none;
      vertical-align: middle;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      .v-icon {
        margin: 24px 0 0 6px;
      }
    }
    &:hover .upload-list-cover {
      display: table-cell;
      background: rgba($color: #000000, $alpha: 0.7);
    }
    .v-image {
      width: 64px;
      height: 64px;
    }
  }
}
</style>