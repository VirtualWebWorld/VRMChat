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
import { Component, Vue } from 'nuxt-property-decorator'
// import { $axios } from '~/utils/axios'
// import {NuxtAxiosInstance} from '@nuxtjs/axios'
interface Event<T = EventTarget> {
  target: T
}

@Component({})
export default class Login extends Vue {
  name: string = ''
  file: Blob | null = null

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
    const fd = new FormData()
    fd.append('name', this.name)
    fd.append('file', this.file as Blob)
    await this.$axios.$post('/upload', fd, {
      headers: {
        'content-type': 'multipart/form-data',
      },
    })
  }
}
</script>

<style lang="stylus" scoped></style>
