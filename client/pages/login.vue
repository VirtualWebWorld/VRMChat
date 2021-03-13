<template lang="pug">
.login-wrap
  .content-wrap
    .title VRMChat
    form(@submit.prevent='submit')
      .input-form
        | name:
        input.name(
          v-model='name',
          type='text',
          name='name',
          maxlength='30',
          :disabled='submitFlag',
          placeholder='Please enter your name'
        )
        div(:class='[{ warning: nameWar && name === "" }, "caution"]')
          div Please use no more than 30 characters for your name
      .input-form
        | model:
        input#file.file(
          ref='fileE',
          type='file',
          name='file',
          accept='.vrm',
          :disabled='submitFlag',
          @change='selectFile'
        )
        div(:class='[{ warning: fileWar }, "caution"]')
          div Select the one with the extension &quot;VRM&quot;
          div Maximum file size is 100MB
      div
        input.submit(type='submit', value='LOGIN', :disabled='submitFlag')
    hr.hr(noshade='')
    input.guest-button(
      type='button',
      value='GUEST LOGIN',
      :disabled='submitFlag',
      @click='guestLogin'
    )
  .links
    a.link(
      href='https://twitter.com/teruru33550336',
      target='_blank',
      rel='noopener noreferrer'
    )
      fa(:icon='faTwitter')
      | Twitter
</template>

<script lang="ts">
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import { Component, Ref, Vue } from 'nuxt-property-decorator'
import { NuxtAxiosInstance } from '@nuxtjs/axios'
interface Event<T = EventTarget> {
  target: T
}

@Component({})
export default class Login extends Vue {
  @Ref() fileE!: HTMLInputElement

  /** data() */
  name: string = ''
  file: File | null = null
  fileWar = false
  nameWar = false
  submitFlag = false
  $axios: NuxtAxiosInstance

  /** computed() */
  get faTwitter() {
    return faTwitter
  }

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
    const fileList = e.target.files
    if (fileList !== null) {
      const file = fileList[0]
      if (file.size <= 104857600) {
        // 100MB
        this.file = file
        this.fileWar = false
      } else {
        this.fileWar = true
      }
    }
  }

  async guestLogin() {
    this.submitFlag = true
    const name = 'GUEST-' + this.randomString()
    this.$store.commit('setName', name)
    this.$store.commit('setFileName', 'three-vrm-girl')
    const fd = new FormData()
    fd.append('id', this.$store.getters.socket.id)
    fd.append('name', name)
    fd.append('fileName', 'guest')
    await this.$axios.$post(`${process.env.baseUrl}/upload`, fd, {
      headers: {
        'content-type': 'multipart/form-data',
      },
    })
    this.$router.push('/')
    this.submitFlag = false
  }

  async submit() {
    this.submitFlag = true
    let warFlag = true
    if (this.file === null) {
      this.fileE.value = ''
      this.fileWar = true
      warFlag = false
    } else if (this.getExt(this.file!.name) !== 'vrm') {
      this.fileE.value = ''
      this.fileWar = true
      warFlag = false
    }

    if (this.name === '') {
      this.nameWar = true
      warFlag = false
    }

    if (warFlag) {
      const fileName = this.randomString()
      this.$store.commit('setName', this.name)
      this.$store.commit('setFileName', fileName)
      const fd = new FormData()
      fd.append('id', this.$store.getters.socket.id)
      fd.append('name', this.name)
      fd.append('fileName', fileName)
      fd.append('file', this.file as Blob)
      await this.$axios.$post(`${process.env.baseUrl}/upload`, fd, {
        headers: {
          'content-type': 'multipart/form-data',
        },
      })
      this.$router.push('/')
    }

    this.submitFlag = false
  }

  randomString() {
    return Math.random().toString(36).slice(-8)
  }
}
</script>

<style lang="stylus" scoped>
.login-wrap
  background #A7A7A7
  height 100vh

.content-wrap
  position absolute
  top 50%
  left 50%
  transform translateX(-50%) translateY(-50%)

link-color = #006C86
.links
  position absolute
  bottom  10%
  left 50%
  transform translateX(-50%)
  .link
    text-decoration none
    color link-color
    &:visited
      color link-color

.title
  font-size 5rem
  text-align center

.input-form
  margin 5px

.name
  width 15rem
  appearance none
  outline none
  border 1px solid #aaa
  transition: all .3s
  padding 5px
  &:focus
    box-shadow 0 0 7px #1abc9c
    border 1px solid #1abc9c

.caution
  font-size 0.7rem
  & > div::before
    content '※'

.warning
  color red

.submit
  width 100%

.guest-button
  width 100%

.hr
  width 100%
  border-color black
</style>
