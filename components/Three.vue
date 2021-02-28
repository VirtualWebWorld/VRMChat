<template>
  <canvas ref="threeCanvas" class="canvas" />
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'nuxt-property-decorator'
import ThreeMain from './js/ThreeMain'
import VAvatar from './js/VAvatar'

@Component({})
export default class Three extends Vue {
  @Ref() threeCanvas!: HTMLCanvasElement

  /** data() */
  threeMain!: ThreeMain
  va!: VAvatar

  keyFront: string = 'w'
  keyLeft: string = 'a'
  keyBack: string = 's'
  keyRight: string = 'd'
  keyCamera: string = 'F4'
  keyArr: { [key: string]: boolean } = {}

  /** mounted() */
  async mounted() {
    this.threeMain = new ThreeMain(this.threeCanvas)
    this.va = new VAvatar(this.threeMain.scene, this.threeMain)
    await this.va.loadAvater()

    window.addEventListener('keydown', (e) => {
      this.keyStatus(e, true)
    })
    window.addEventListener('keyup', (e) => {
      this.keyStatus(e, false)
    })
    window.addEventListener('resize', () => {
      this.threeMain.renderer.setSize(window.innerWidth, window.innerHeight)
      this.threeMain.camera.aspect = window.innerWidth / window.innerHeight
      this.threeMain.camera.updateProjectionMatrix()
    })
    window.addEventListener('mouseleave', () => {
      for (const i in this.keyArr) {
        this.keyArr[i] = false
      }
    })

    this.loop()
  }

  /** methods() */
  keyStatus(e: KeyboardEvent, state: boolean) {
    if (e.key === this.keyFront) {
      this.keyArr.w = state
    }
    if (e.key === this.keyLeft) {
      this.keyArr.a = state
    }
    if (e.key === this.keyBack) {
      this.keyArr.s = state
    }
    if (e.key === this.keyRight) {
      this.keyArr.d = state
    }
    if (e.key === this.keyCamera && this.keyArr.camera !== state) {
      this.keyArr.camera = state
      if (state) {
        this.va.cameraChange()
      }
    }
  }

  loop() {
    if (this.keyArr.w) {
      this.va.move('w')
    }
    if (this.keyArr.a) {
      this.va.move('a')
    }
    if (this.keyArr.s) {
      this.va.move('s')
    }
    if (this.keyArr.d) {
      this.va.move('d')
    }
    this.va.animate()
    this.threeMain.animate()
    requestAnimationFrame(this.loop)
  }
}
</script>

<style lang="stylus" scoped>
.canvas
  position absolute
  top 0
  left 0
  z-index -1
</style>
