<template>
  <canvas ref="threeCanvas" class="canvas" />
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'nuxt-property-decorator'
import { io, Socket } from 'socket.io-client'
import { VRM } from '@pixiv/three-vrm'
import ThreeMain from './js/ThreeMain'
import VAvatar from './js/VAvatar'

export interface VRMData {
  id: string
  name: string
  vrm: VRM | null
}

export interface VRMState {
  id: string
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
}

@Component({})
export default class Three extends Vue {
  @Ref() threeCanvas!: HTMLCanvasElement

  /** data() */
  threeMain!: ThreeMain
  va!: VAvatar

  socket: Socket = io(`${process.env.baseUrl}/api`)
  vrmArr: VRMData[] = []

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

    const firstData: VRMData = {
      id: this.socket.id,
      name: 'a',
      vrm: null,
    }

    this.socket
      .emit('join-ping')
      .emit('send-vrm', firstData)
      .on('join-pong', (data: any[]) => {
        data.forEach(async (element) => {
          await this.newVRMLoad(element)
        })
      })
      .on('new-vrm', async (data: VRMData) => {
        await this.newVRMLoad(data)
      })
      .on('old-vrm', (data: VRMData) => {
        const vsd = this.vrmArr.find((d) => d.id === data.id)
        if (vsd !== undefined) {
          this.threeMain.scene.remove(vsd.vrm!.scene)
        }
      })
      .on('new-vrm-data', (data: VRMState) => {
        const vsd = this.vrmArr.find((d) => d.id === data.id)
        if (vsd !== undefined) {
          const vrm = vsd.vrm!.scene
          vrm.position.x = data.x
          vrm.position.y = data.y
          vrm.position.z = data.z
          vrm.rotation.x = data.rx
          vrm.rotation.y = data.ry
          vrm.rotation.z = data.rz
        }
      })

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

  async newVRMLoad(data: VRMData) {
    const gltf = await this.va.loadVRM()
    data.vrm = await this.va.loadModel(gltf)
    this.va.vrmSet(data.vrm)
    this.vrmArr.push(data)
    this.threeMain.scene.add(data.vrm!.scene)
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
    const positionData: VRMState = {
      id: this.socket!.id,
      x: this.va.vrm.scene.position.x,
      y: this.va.vrm.scene.position.y,
      z: this.va.vrm.scene.position.z,
      rx: this.va.vrm.scene.rotation.x,
      ry: this.va.vrm.scene.rotation.y,
      rz: this.va.vrm.scene.rotation.z,
    }
    this.socket!.emit('send-vrm-data', positionData)
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
