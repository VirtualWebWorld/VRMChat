<template>
  <section class="section">
    <div class="field">
      <div class="control">
        <input
          v-model="msg"
          class="input"
          type="text"
          placeholder="message"
          @keypress.enter.exact="sendMessage"
        />
      </div>
    </div>
    <article v-for="(msg, index) in msgs" :key="index" class="media">
      <div class="media-content">
        <div class="content">
          <p>
            <strong>{{ msg.name }}</strong>
            <br />
            {{ msg.text }}
          </p>
        </div>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Socket } from 'socket.io-client'

export interface Message {
  name: string
  text: string
}

@Component({})
export default class Chat extends Vue {
  /** data() */
  msg: string = ''
  msgs: Message[] = []
  socket: Socket = this.$store.state.socket

  /** mounted() */
  mounted() {
    this.socket.on('new-msg', (msg: Message) => {
      this.msgs.push(msg)
    })
  }

  /** methods() */
  sendMessage() {
    this.msg = this.msg.trim()
    if (this.socket != null && this.msg) {
      const message = {
        name: this.socket.id,
        text: this.msg,
      }
      this.msgs.push(message)
      this.socket.emit('send-msg', message)
      this.msg = ''
    }
  }
}
</script>

<style lang="stylus" scoped>
.section
  position absolute
  right 0
  bottom 0
  width 30%
  max-width 300px
  height 40%
  max-height 370px
  background red

.media-content
  height 100%

.content
  color white
</style>
