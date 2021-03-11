<template>
  <div class="login-wrap">
    <div class="content-wrap">
      <div class="title">VRMChat</div>
      <form @submit.prevent="submit">
        <div class="input-form">
          name:
          <input
            v-model="name"
            class="name"
            type="text"
            name="name"
            maxlength="30"
            placeholder="Please enter your name"
            required
          />
          <div class="name-war">
            ※Please use no more than 30 characters for your name
          </div>
        </div>
        <div class="input-form">
          model:
          <input
            id="file"
            ref="fileE"
            class="file"
            type="file"
            name="file"
            accept=".vrm"
            required
            @change="selectFile"
          />
          <div class="file-war">※Select the one with the extension "VRM"</div>
        </div>
        <div>
          <input class="submit" type="submit" value="submit" />
        </div>
      </form>
    </div>
    <div class="links">
      <a
        href="https://twitter.com/teruru33550336"
        class="link"
        target="_blank"
        rel="noopener noreferrer"
        ><fa :icon="faTwitter" />Twitter</a
      >
    </div>
  </div>
</template>

<script lang="ts">
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
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
      await this.$axios.$post(`${process.env.baseUrl}/upload`, fd, {
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

.input-form
  margin 5px

.name-war
  font-size 0.7rem
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

.file-war
  font-size 0.7rem

.submit
  width 100%
</style>
