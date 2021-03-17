import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import ThreeMain from './ThreeMain'
import Camera from './avatarcontrol/Camera'
export default class VAvatar {
  loader: GLTFLoader
  scene: THREE.Scene
  vrm!: VRM
  vrmAngle: number = 0
  schema: any = null
  three: ThreeMain
  camera!: Camera
  store: any
  constructor(three: ThreeMain) {
    this.scene = three.scene
    this.loader = new GLTFLoader()
    this.three = three
  }

  async loadAvater(store: any, path: string) {
    this.store = store
    this.vrm = await this.loadAvaterModel(path)
    this.camera = new Camera(this.three, this.vrm)
  }

  async loadAvaterModel(path: string) {
    const gltf = await this.loadVRM(path)
    const vrm = await this.loadModel(gltf)
    this.vrmSet(vrm)
    return vrm
  }

  loadModel(gltf: any): Promise<VRM> {
    return new Promise((resolve) => {
      VRM.from(gltf).then((vrm) => {
        resolve(vrm)
      })
    })
  }

  vrmSet(vrm: VRM) {
    this.scene.add(vrm.scene)
    this.schema = VRMSchema
    vrm.humanoid!.setPose({
      [VRMSchema.HumanoidBoneName.LeftUpperArm]: {
        rotation: [0, 0, 0.5, 1],
      },
      [VRMSchema.HumanoidBoneName.RightUpperArm]: {
        rotation: [0, 0, -0.5, 1],
      },
    })
  }

  loadVRM(path: string): Promise<any> {
    return new Promise((resolve) => {
      this.loader.load(
        path,
        (gltf) => {
          resolve(gltf)
        },
        (progress) => {
          const par = Math.floor((progress.loaded / progress.total) * 100)
          this.store.commit('loadCount', par)
        },
        (error) => {
          console.error(error)
        }
      )
    })
  }

  move(vector: THREE.Vector2) {
    const rotate = this.three.getCameraAngle()
    const rotatedVector = vector.rotateAround(new THREE.Vector2(), rotate.y)
    const moveX = 0.1 * rotatedVector.x
    const moveZ = -0.1 * rotatedVector.y
    this.vrm.scene.position.x += moveX
    this.vrm.scene.position.z += moveZ

    this.camera.moveCamera(moveX, moveZ)
  }

  cameraChange() {
    this.camera.cameraChange()
  }

  controlLock(flag: boolean) {
    this.camera.controlLock(flag)
  }

  animate() {
    this.camera.animate()
    this.vrm.update(this.three.clock.getDelta())
  }
}
