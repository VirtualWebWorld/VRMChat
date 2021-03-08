<template>
  <div>
    <form @submit.prevent="submit">
      <input
        v-model="name"
        type="text"
        name="name"
        maxlength="12"
        placeholder="Please enter your name"
        required
      />
      <input
        ref="file"
        type="file"
        name="file"
        accept=".vrm"
        required
        @change="selectFile"
      />
      <input type="submit" value="submit" />
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'nuxt-property-decorator'
interface Event<T = EventTarget> {
  target: T
}

@Component({})
export default class Login extends Vue {
  @Ref() fileE!: HTMLInputElement

  /** data() */
  name: string = ''
  file: File | null = null

  /** mounted() */
  mounted() {
    this.$store.commit('setName', '')
  }

  /** methods() */
  getExt(filename: string) {
    const pos = filename.lastIndexOf('.')
    if (pos === -1) return ''
    return filename.slice(pos + 1)
  }

  selectFile(e: Event<HTMLInputElement>) {
    const file = e.target.files
    if (file !== null) {
      this.file = file[0]
    }
  }

  async submit() {
    if (this.getExt(this.file!.name) === 'vrm') {
      const fileName = this.randomString()
      this.$store.commit('setName', this.name)
      this.$store.commit('setFileName', fileName)
      const fd = new FormData()
      fd.append('id', this.$store.getters.socket.id)
      fd.append('name', this.name)
      fd.append('fileName', fileName)
      fd.append('file', this.file as Blob)
      await this.$axios.$post('/upload', fd, {
        headers: {
          'content-type': 'multipart/form-data',
        },
      })
      this.$router.push('/')
    } else {
      window.alert('Please select the correct file.')
      this.fileE.value = ''
    }
  }

  randomString() {
    return Math.random().toString(36).slice(-8)
  }
}
</script>

<style lang="stylus" scoped></style>
