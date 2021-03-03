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
  clock: THREE.Clock
  camera!: Camera
  gltf: any
  constructor(scene: THREE.Scene, three: ThreeMain) {
    this.scene = scene
    this.loader = new GLTFLoader()
    this.three = three
    this.clock = new THREE.Clock()
    this.clock.start()
  }

  async loadAvater() {
    this.gltf = await this.loadVRM()
    this.vrm = await this.loadModel()
    this.vrmSet(this.vrm)
    this.camera = new Camera(this.three, this.vrm)
  }

  loadModel(gltf: any = this.gltf): Promise<VRM> {
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

  loadVRM(): Promise<any> {
    return new Promise((resolve) => {
      this.loader.load(
        // 'akatsuki1910.vrm',
        'three-vrm-girl.vrm',
        (gltf) => {
          resolve(gltf)
        },
        (progress) =>
          console.log(
            'Loading model...',
            100.0 * (progress.loaded / progress.total),
            '%'
          ),
        (error) => console.error(error)
      )
    })
  }

  move(vector: THREE.Vector2) {
    const angle = this.three.camera.quaternion
    const rotate = new THREE.Euler().setFromQuaternion(angle, 'YXZ')
    this.vrm.scene.rotation.y = rotate.y

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

  animate() {
    this.camera.animate()
    this.vrm.update(this.clock.getDelta())
  }
}
