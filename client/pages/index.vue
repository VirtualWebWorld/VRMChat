<template lang="pug">
div
  Three(ref='three')
  Chat
  Loading
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'nuxt-property-decorator'
import { Context } from '@nuxt/types'
import { Socket } from 'socket.io-client'
import VueRouter from 'vue-router'
import Three from '../components/Three.vue'

Component.registerHooks(['beforeRouteLeave'])
@Component({})
export default class Index extends Vue {
  @Ref() three!: Three

  /** data() */
  socket: Socket = this.$store.getters.socket

  /** middleware() */
  middleware({ store, redirect }: Context) {
    if (store.getters.name === '') {
      return redirect('/login')
    }
  }

  beforeRouteLeave(_to: VueRouter, _from: VueRouter, next: any) {
    // this.socket.emit('tping')
    cancelAnimationFrame(this.three.loopAnime)
    this.socket.emit('logout')
    next()
  }
}
</script>

<style lang="stylus" scoped></style>
