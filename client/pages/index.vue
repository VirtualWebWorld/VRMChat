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

@Component({})
export default class Index extends Vue {
  /** middleware() */
  middleware({ store, redirect }: Context) {
    if (store.getters.name === '') {
      return redirect('/login')
    }
  }
}
</script>

<style lang="stylus" scoped></style>
