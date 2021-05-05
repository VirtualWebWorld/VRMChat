<template lang="pug">
canvas.canvas(ref='threeCanvas', @mousedown='keyLockFree')
</template>

<script lang="ts">
import * as THREE from 'three'
import { Component, Ref, Vue, Watch } from 'nuxt-property-decorator'
import { Socket } from 'socket.io-client'
import { VRM } from '@pixiv/three-vrm'
import { VRMData, VRMState, VRMMove } from '../domain'
import Direction from './js/avatarcontrol/Direction'
import ThreeMain from './js/ThreeMain'
import VAvatar from './js/VAvatar'
import Nameplate from './js/Nameplate'

interface VRMAvatarData {
  id: string
  name: string
  vrm: VRM
  np: THREE.Sprite
  h: number
}

@Component({})
export default class Three extends Vue {
  @Ref() threeCanvas!: HTMLCanvasElement

  /** data() */
  threeMain!: ThreeMain
  va!: VAvatar

  socket: Socket = this.$store.getters.socket
  vrmADArr: VRMAvatarData[] = []
  vrmAMArr = new Map<string, { move: THREE.Vector2; angle: number }>()
  loopAnime: number = 0

  keyFront: string = 'w'
  keyLeft: string = 'a'
  keyBack: string = 's'
  keyRight: string = 'd'
  keyCamera: string = 'F4'
  keyLock = false

  moveDirection: Direction = new Direction()
  cameraChanging: boolean = false
  np: Nameplate = new Nameplate()

  fpsInterval = 1000 / 60
  fixInterval = 1000 / 1
  fpsThenTime = 0
  fixThenTime = 0

  /** computed() */
  get cFlag() {
    return this.$store.getters.commentFlag
  }

  /** watch() */
  @Watch('cFlag')
  commentFocus() {
    this.keyLock = this.cFlag
    this.va.controlLock(this.cFlag)
  }

  /** mounted() */
  async mounted() {
    this.threeMain = new ThreeMain(this.threeCanvas)
    this.va = new VAvatar(this.threeMain)
    await this.va.loadAvater(
      this.$store,
      this.modelPath(this.$store.getters.fileName)
    )

    this.socket
      .emit('join-ping')
      .emit('send-vrm', this.socket.id)
      .on('join-pong', (data: VRMData[]) => {
        data.forEach(async (element) => {
          await this.newVRMLoad(element)
        })
      })
      .on('new-vrm', async (data: VRMData) => {
        await this.newVRMLoad(data)
      })
      .on('old-vrm', (data: VRMData) => {
        const vsd = this.vrmADArr.find((d) => d.id === data.id)
        if (vsd !== undefined) {
          this.threeMain.scene.remove(vsd.vrm!.scene)
          this.threeMain.scene.remove(vsd.np)
        }
      })
      .on('new-vrm-data', (data: VRMState) => {
        const vsd = this.vrmADArr.find((d) => d.id === data.id)
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
      .on('new-vrm-move', (data: VRMMove) => {
        this.vrmAMArr.set(data.id, { move: data.move, angle: data.angle })
      })

    window.addEventListener('keydown', (e) => {
      this.keyState('down', e)
    })
    window.addEventListener('keyup', (e) => {
      this.keyState('up', e)
    })
    window.addEventListener('resize', () => {
      this.threeMain.renderer.setSize(window.innerWidth, window.innerHeight)
      this.threeMain.camera.aspect = window.innerWidth / window.innerHeight
      this.threeMain.camera.updateProjectionMatrix()
    })
    document.addEventListener('mouseleave', () => {
      this.keyInitial()
    })

    this.fpsThenTime = Date.now()
    this.fixThenTime = Date.now()
    this.loopAnime = requestAnimationFrame(this.loop)
  }

  /** methods() */
  modelPath(path: string) {
    return process.env.baseUrl + '/models/' + path + '.vrm'
  }

  keyLockFree() {
    this.$store.commit('isComment', false)
  }

  keyInitial() {
    for (const i in this.moveDirection.keyArr) {
      this.moveDirection.keyArr[i] = false
    }
  }

  keyState(state: string, e: KeyboardEvent) {
    if (!this.keyLock) {
      switch (state) {
        case 'down':
          this.keyDown(e)
          break
        case 'up':
          this.keyUp(e)
          break
      }
    }
  }

  keyDown(e: KeyboardEvent) {
    switch (e.key) {
      case this.keyFront:
        this.moveDirection.keyArr.front = true
        break
      case this.keyLeft:
        this.moveDirection.keyArr.left = true
        break
      case this.keyBack:
        this.moveDirection.keyArr.back = true
        break
      case this.keyRight:
        this.moveDirection.keyArr.right = true
        break
      case this.keyCamera:
        if (!this.cameraChanging) {
          this.cameraChanging = true
          this.va.cameraChange()
        }
        break
      case 'Enter':
        this.$store.commit('isComment', true)
        this.keyInitial()
        e.preventDefault()
        break
    }
  }

  keyUp(e: KeyboardEvent) {
    switch (e.key) {
      case this.keyFront:
        this.moveDirection.keyArr.front = false
        break
      case this.keyLeft:
        this.moveDirection.keyArr.left = false
        break
      case this.keyBack:
        this.moveDirection.keyArr.back = false
        break
      case this.keyRight:
        this.moveDirection.keyArr.right = false
        break
      case this.keyCamera:
        this.cameraChanging = false
        break
    }
  }

  async newVRMLoad(data: VRMData) {
    const model = await this.va.loadAvaterModel(this.modelPath(data.vrm))
    this.threeMain.scene.add(model.scene)

    const bBox = new THREE.Box3().setFromObject(model.scene)
    const bSize = bBox.max.sub(bBox.min)
    const bHight = bSize.y

    const namePlate = this.np.namePlate(data.name)
    namePlate.position.y = bHight + 0.2
    this.threeMain.scene.add(namePlate)

    const vrmData: VRMAvatarData = {
      id: data.id,
      name: data.name,
      vrm: model,
      np: namePlate,
      h: bHight,
    }
    this.vrmADArr.push(vrmData)
  }

  moveNamePlate(vsd: VRMAvatarData) {
    const np = vsd.np
    const vp = vsd.vrm.scene.position
    np.position.x = vp.x
    np.position.y = vp.y + vsd.h + 0.2
    np.position.z = vp.z
  }

  loop() {
    const now = Date.now()

    const fpsElapsed = now - this.fpsThenTime
    if (fpsElapsed > this.fpsInterval) {
      // 60fps
      this.fpsThenTime = now - (fpsElapsed % this.fpsInterval)

      for (const dAD of this.vrmADArr) {
        const dAM = this.vrmAMArr.get(dAD.id)
        if (dAM !== undefined) {
          const moveD = this.va.moveDis(dAM.move, dAM.angle)
          dAD.vrm.scene.position.x += moveD.x
          dAD.vrm.scene.position.z += moveD.z
          dAD.vrm.scene.rotation.y = dAM.angle
        }
      }

      const moveNum = this.moveDirection.toVector2()
      if (!(moveNum.x === 0 && moveNum.y === 0)) {
        this.va.move(moveNum)
      }
      this.va.animate()
      const moveData: VRMMove = {
        id: this.socket!.id,
        move: moveNum,
        angle: this.va.vrm.scene.rotation.y,
      }
      this.socket!.volatile.emit('send-vrm-move', moveData)
    }

    const fixElapsed = now - this.fixThenTime
    if (fixElapsed > this.fixInterval) {
      // 1fps
      this.fixThenTime = now - (fixElapsed % this.fixInterval)

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
    }

    this.vrmADArr.forEach((vsd) => this.moveNamePlate(vsd))
    this.threeMain.animate()
    this.loopAnime = requestAnimationFrame(this.loop)
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
