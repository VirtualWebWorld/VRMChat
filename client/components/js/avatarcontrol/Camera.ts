import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import ThreeMain from '../ThreeMain'

export default class Camera {
  cameraMode: string[]
  cameraModeNum: number
  camera: THREE.PerspectiveCamera
  tpsControls: OrbitControls
  fpsControls: PointerLockControls
  vrm: VRM
  three: ThreeMain
  cLock: boolean
  constructor(three: ThreeMain, vrm: VRM) {
    this.three = three
    this.cameraMode = ['TPS', 'FPS']
    this.cameraModeNum = 1
    this.camera = three.camera
    this.tpsControls = new OrbitControls(
      three.camera,
      three.renderer.domElement
    )
    this.tpsControls.minDistance = 1
    this.tpsControls.maxDistance = 50

    this.fpsControls = new PointerLockControls(
      three.camera,
      three.renderer.domElement
    )

    this.cLock = false

    this.vrm = vrm

    three.renderer.domElement.addEventListener('click', () => {
      if (this.cameraMode[this.cameraModeNum] === 'FPS') {
        this.fpsControls.connect()
        this.fpsControls.lock()
      }
    })

    this.moveCamera()
  }

  cameraChange() {
    this.cameraModeNum = (this.cameraModeNum + 1) % this.cameraMode.length
    switch (this.cameraMode[this.cameraModeNum]) {
      case 'TPS':
        // dis fps
        this.fpsControls.unlock()
        this.fpsControls.disconnect()

        // co tps
        this.tpsControls.reset()
        this.tpsControls.enabled = true
        this.camera.position.x =
          this.vrm.scene.position.x + 5 * Math.sin(this.vrm.scene.rotation.y)
        this.camera.position.y = this.vrm.scene.position.y + 2
        this.camera.position.z =
          this.vrm.scene.position.z + 5 * Math.cos(this.vrm.scene.rotation.y)
        this.vrm.humanoid
          ?.getBoneNode(VRMSchema.HumanoidBoneName.Head)
          ?.rotation.set(0, 0, 0)
        break
      case 'FPS':
        // dis tps
        this.tpsControls.saveState()
        this.tpsControls.enabled = false

        // co fps
        this.fpsControls.connect()
        this.fpsControls.lock()
        break
    }
    this.moveCamera()
  }

  controlLock(flag: boolean) {
    if (flag) {
      switch (this.cameraMode[this.cameraModeNum]) {
        case 'TPS':
          this.tpsControls.enabled = false
          break
        case 'FPS':
          this.fpsControls.unlock()
          this.fpsControls.disconnect()
          break
      }
    } else {
      switch (this.cameraMode[this.cameraModeNum]) {
        case 'TPS':
          this.tpsControls.enabled = true
          break
        case 'FPS':
          this.fpsControls.connect()
          this.fpsControls.lock()
          break
      }
    }
  }

  moveCamera(x: number = 0, z: number = 0) {
    switch (this.cameraMode[this.cameraModeNum]) {
      case 'TPS':
        this.moveCameraTPS(x, z)
        break
      case 'FPS':
        this.moveCameraFPS()
        break
    }
  }

  animate() {
    switch (this.cameraMode[this.cameraModeNum]) {
      case 'TPS':
        this.tpsControls.update()
        break
      case 'FPS':
        this.rotateCameraFPS()
        break
    }
  }

  headPosition() {
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
    return p
  }

  moveCameraTPS(x: number, z: number) {
    this.camera.position.x += x
    this.camera.position.z += z
    const p = this.headPosition()
    const rotate = this.three.getCameraAngle()
    this.vrm.scene.rotation.y = rotate.y
    this.tpsControls.target.set(p.x, p.y, p.z)
  }

  moveCameraFPS() {
    const p = this.headPosition()
    this.camera.position.set(p.x, p.y, p.z)
  }

  rotateCameraFPS() {
    const angle = this.fpsControls.getObject().quaternion
    const rotate = new THREE.Euler().setFromQuaternion(angle, 'YXZ')
    this.vrm.scene.rotation.y = rotate.y
    this.vrm.humanoid
      ?.getBoneNode(VRMSchema.HumanoidBoneName.Head)
      ?.rotation.set(rotate.x, 0, 0)
    this.moveCameraFPS()
  }
}
