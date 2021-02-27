import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import ThreeMain from './ThreeMain'

export default class VAvatar {
  loader: GLTFLoader
  scene: THREE.Scene
  vrm!: VRM
  vrmAngle: number = 0
  schema: any = null
  three: ThreeMain
  clock: THREE.Clock
  constructor(scene: THREE.Scene, three: ThreeMain) {
    this.scene = scene
    this.loader = new GLTFLoader()
    this.three = three
    this.clock = new THREE.Clock()
    this.clock.start()
  }

  async loadAvater() {
    const gltf = await this.loadVRM()
    await VRM.from(gltf).then((vrm) => {
      this.scene.add(vrm.scene)
      // vrm.scene.rotation.y = Math.PI
      this.schema = VRMSchema
      vrm.humanoid!.setPose({
        [VRMSchema.HumanoidBoneName.LeftUpperArm]: {
          rotation: [0, 0, 0.5, 1],
        },
        [VRMSchema.HumanoidBoneName.RightUpperArm]: {
          rotation: [0, 0, -0.5, 1],
        },
      })
      this.vrm = vrm
    })
  }

  loadVRM(): Promise<any> {
    return new Promise((resolve) => {
      this.loader.load(
        'akatsuki1910.vrm',
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

  move(key: string) {
    let keyNum: number = 0
    switch (key) {
      case 'w':
        keyNum = 0
        break
      case 'a':
        keyNum = 1
        break
      case 's':
        keyNum = 2
        break
      case 'd':
        keyNum = 3
        break
    }
    const angle = this.three.camera.quaternion
    const rotate = new THREE.Euler().setFromQuaternion(angle, 'YXZ')
    this.vrm.scene.rotation.y = rotate.y

    const moveX = 0.1 * Math.cos(((keyNum + 1) * Math.PI) / 2 + rotate.y)
    const moveZ = -0.1 * Math.sin(((keyNum + 1) * Math.PI) / 2 + rotate.y)
    this.vrm.scene.position.x += moveX
    this.vrm.scene.position.z += moveZ
    this.three.camera.position.x += moveX
    this.three.camera.position.z += moveZ
  }

  animate() {
    this.three.controls.target.set(
      this.vrm.scene.position.x,
      this.vrm.scene.position.y,
      this.vrm.scene.position.z
    )
    this.vrm.update(this.clock.getDelta())
  }
}
