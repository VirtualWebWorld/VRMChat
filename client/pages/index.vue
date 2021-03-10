<template>
  <div>
    <Three />
    <Chat />
    <Loading />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Context } from '@nuxt/types'
import { Socket } from 'socket.io-client'
import VueRouter from 'vue-router'

Component.registerHooks(['beforeRouteLeave'])
@Component({})
export default class Index extends Vue {
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
    this.socket.emit('logout')
    next()
  }
}
</script>

<style lang="stylus" scoped></style>
