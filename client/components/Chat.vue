<template>
  <div :class="[{ loading: isLoad }, 'message']">
    <div class="chat">
      <div ref="chat" class="chat-frame">
        <div v-for="(msg, index) in msgs" :key="index" class="content">
          <div class="name">{{ msg.name }}</div>
          <div class="text">{{ msg.text }}</div>
        </div>
      </div>
    </div>
    <div class="field">
      <div class="field-frame">
        <textarea
          ref="text"
          v-model="msg"
          class="input"
          placeholder="message"
          @focus="focusArea"
          @keydown.enter.exact="keyDownEnter"
          @keyup.enter.exact="keyUpEnter"
          @keydown.enter.shift.exact="keyEnterShift"
        />
        <button class="button" @click="sendMessage">送信</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, NextTick, Ref, Vue, Watch } from 'nuxt-property-decorator'
import { Socket } from 'socket.io-client'

export interface Message {
  name: string
  text: string
}

@Component({})
export default class Chat extends Vue {
  @Ref() chat!: HTMLDivElement
  @Ref() text!: HTMLTextAreaElement

  /** data() */
  msg: string = ''
  msgs: Message[] = []
  socket: Socket = this.$store.getters.socket
  isShiftPush = false
  autoScroll = false
  isLoad = true

  /** computed() */
  get isLoadFlag() {
    return this.$store.getters.isLoad
  }

  get cFlag() {
    return this.$store.getters.commentFlag
  }

  /** watch() */
  @Watch('isLoadFlag')
  loadFlag(flag: boolean) {
    this.isLoad = !flag
  }

  @Watch('cFlag')
  commentForcus() {
    if (this.cFlag) {
      this.text.focus()
      this.focusArea()
    } else {
      this.$store.commit('isComment', false)
      this.text.blur()
    }
  }

  /** mounted() */
  mounted() {
    this.socket.on('new-msg', (msg: Message) => {
      this.msgs.push(msg)
    })
  }

  /** methods() */
  focusArea(e: any = null) {
    if (e !== null) {
      e.preventDefault()
    }
    this.$store.commit('isComment', true)
  }

  keyDownEnter(e: any) {
    e.preventDefault()
    if (!this.isShiftPush) {
      this.sendMessage()
    }
  }

  keyUpEnter(e: any) {
    e.preventDefault()
    this.isShiftPush = false
  }

  keyEnterShift() {
    this.isShiftPush = true
  }

  @NextTick('scrollYBottom')
  sendMessage() {
    const chatLog = this.chat
    this.autoScroll =
      chatLog.scrollHeight - chatLog.scrollTop <= chatLog.clientHeight

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

  scrollYBottom() {
    const chatLog = this.chat
    if (this.autoScroll) {
      chatLog.scrollTop = chatLog.scrollHeight
    }
  }
}
</script>

<style lang="stylus" scoped>
filed-height = 3rem
.loading
  display none

.message
  position absolute
  right 0
  bottom 0
  width 30%
  max-width 300px
  height 40%
  max-height 370px
  background #ddd
.field
  height filed-height
  box-sizing border-box
  .field-frame
    padding 2px
    height 100%
    box-sizing border-box
    .input
      box-sizing border-box
      resize none
      outline 0
      vertical-align top
      width calc(75% - 8px)
      height 100%
      padding 0
    .button
      margin 0
      height 100%
      width 25%

.chat
  height "calc(100% - %s)" % filed-height
  padding 2px
  box-sizing border-box
  .chat-frame
    padding 2px
    border 2px solid black
    box-sizing border-box
    height 100%
    overflow-y scroll
    .content
      color black
      &:not(:last-child)
        border-bottom 1px solid black
      .name
        font-size 0.7rem
        width 100%
        overflow hidden
        white-space nowrap
        text-overflow ellipsis
      .text
        font-size 0.8rem
        overflow-wrap break-word
</style>
