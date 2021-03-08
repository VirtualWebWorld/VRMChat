import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import ThreeMain from '../ThreeMain'

export default class Camera {
  cameraMode: string[]
  cameraModeNum: number
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  vrm: VRM
  angle: { a: number; p: number }
  mouse: { x0: number; y0: number; x: number; y: number }
  vrmRotateMem: { x: number; y: number; z: number }
  isMouseDown: boolean
  constructor(three: ThreeMain, vrm: VRM) {
    this.cameraMode = ['TPS', 'FPS']
    this.cameraModeNum = 0
    this.camera = three.camera
    this.controls = three.controls
    this.vrm = vrm
    this.angle = {
      a: 0,
      p: 0,
    }

    this.mouse = {
      x0: 0,
      y0: 0,
      x: 0,
      y: 0,
    }

    this.vrmRotateMem = {
      x: 0,
      y: 0,
      z: 0,
    }

    this.isMouseDown = false

    window.addEventListener('mousedown', (e) => {
      this.isMouseDown = true
      this.mouse.x0 = e.pageX
      this.mouse.y0 = e.pageY
      this.vrmRotateMem.x = this.vrm.scene.rotation.x
      this.vrmRotateMem.y = this.vrm.scene.rotation.y
      this.vrmRotateMem.z = this.vrm.scene.rotation.z
    })
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.pageX
      this.mouse.y = e.pageY
      if (this.cameraMode[this.cameraModeNum] === 'FPS' && this.isMouseDown) {
        this.cameraRotateFPS()
      }
    })
    window.addEventListener('mouseup', () => {
      this.isMouseDown = false
    })
  }

  cameraChange() {
    this.cameraModeNum = (this.cameraModeNum + 1) % this.cameraMode.length
    if (this.cameraMode[this.cameraModeNum] === 'TPS') {
      this.controls.reset()
      this.controls.enabled = true
      this.camera.position.x =
        this.vrm.scene.position.x + 5 * Math.sin(this.vrm.scene.rotation.y)
      this.camera.position.y = this.vrm.scene.position.y + 2
      this.camera.position.z =
        this.vrm.scene.position.z + 5 * Math.cos(this.vrm.scene.rotation.y)
    } else {
      this.controls.saveState()
      this.controls.enabled = false
    }
    this.moveCamera()
  }

  moveCamera(x: number = 0, z: number = 0) {
    switch (this.cameraMode[this.cameraModeNum]) {
      case 'TPS':
        this.cameraTPS(x, z)
        break
      case 'FPS':
        this.camera.rotation.set(0, this.vrm.scene.rotation.y, 0)
        this.cameraFPS()
        break
    }
  }

  animate() {
    if (this.cameraMode[this.cameraModeNum] === 'TPS') {
      this.controls.update()
    }
  }

  cameraTPS(x: number, z: number) {
    this.camera.position.x += x
    this.camera.position.z += z
    this.controls.target.set(
      this.vrm.scene.position.x,
      this.vrm.scene.position.y,
      this.vrm.scene.position.z
    )
  }

  cameraFPS() {
    const lp = this.vrm.humanoid
      ?.getBoneNode(VRMSchema.HumanoidBoneName.LeftEye)
      ?.getWorldPosition(new THREE.Vector3())
    const rp = this.vrm.humanoid
      ?.getBoneNode(VRMSchema.HumanoidBoneName.RightEye)
      ?.getWorldPosition(new THREE.Vector3())
    const an = this.vrm.scene.rotation.y
    const dis = 0.07
    const p = {
      x: (lp!.x + rp!.x) / 2 - dis * Math.sin(an),
      y: (lp!.y + rp!.y) / 2,
      z: (lp!.z + rp!.z) / 2 - dis * Math.cos(an),
    }
    this.camera.position.set(p.x, p.y, p.z)
  }

  cameraRotateFPS() {
    const rotateY = (this.mouse.x - this.mouse.x0) * 0.005
    // const rotateX = (this.mouse.y - this.mouse.y0) * 0.2
    this.vrm.scene.rotation.y = this.vrmRotateMem.y - rotateY
    this.camera.rotation.y = this.vrm.scene.rotation.y
    this.cameraFPS()
  }
}
