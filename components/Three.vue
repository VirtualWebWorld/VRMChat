<template>
  <canvas ref="threeCanvas" class="canvas" />
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'nuxt-property-decorator'
import { io, Socket } from 'socket.io-client'
import { VRMData, VRMState, Direction } from '../domain'
import ThreeMain from './js/ThreeMain'
import VAvatar from './js/VAvatar'

@Component({})
export default class Three extends Vue {
  @Ref() threeCanvas!: HTMLCanvasElement

  /** data() */
  threeMain!: ThreeMain
  va!: VAvatar

  socket: Socket = io(`${process.env.baseUrl}`)
  vrmArr: VRMData[] = []

  keyFront: string = 'w'
  keyLeft: string = 'a'
  keyBack: string = 's'
  keyRight: string = 'd'
  keyCamera: string = 'F4'
  keyArr: { [key: string]: boolean } = {}

  moveDirection: Direction = new Direction()
  cameraChanging: boolean = false

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

    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
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
  keyDown(e: KeyboardEvent) {
    switch (e.key) {
      case this.keyFront:
        this.moveDirection.moveFront()
        break
      case this.keyLeft:
        this.moveDirection.moveLeft()
        break
      case this.keyBack:
        this.moveDirection.moveBack()
        break
      case this.keyRight:
        this.moveDirection.moveRight()
        break
      case this.keyCamera:
        if (!this.cameraChanging) {
          this.cameraChanging = true
          this.va.cameraChange()
        }
        break
    }
  }

  keyUp(e: KeyboardEvent) {
    switch (e.key) {
      case this.keyFront:
      case this.keyBack:
        this.moveDirection.stopY()
        break
      case this.keyLeft:
      case this.keyRight:
        this.moveDirection.stopX()
        break
      case this.keyCamera:
        this.cameraChanging = false
        break
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
    this.va.move(this.moveDirection.toVector2())
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
