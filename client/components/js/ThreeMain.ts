import * as THREE from 'three'
// import Stats from 'three/examples/jsm/libs/stats.module'

export default class ThreeMain {
  canvas: HTMLCanvasElement
  height: number
  width: number
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  // stats: Stats
  axesHelper: THREE.AxesHelper
  gridHelper: THREE.GridHelper
  light: THREE.PointLight
  lightHelper: THREE.PointLightHelper
  clock: THREE.Clock
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    })
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.1,
      10000
    )

    this.clock = new THREE.Clock()
    this.clock.start()

    // eslint-disable-next-line unicorn/number-literal-case
    this.light = new THREE.PointLight(0xffffff, 2, 50, 1)
    this.scene.add(this.light)

    this.lightHelper = new THREE.PointLightHelper(this.light)
    this.scene.add(this.lightHelper)
    // this.stats = Stats()
    this.axesHelper = new THREE.AxesHelper(10000)
    this.scene.add(this.axesHelper)
    this.gridHelper = new THREE.GridHelper(1000, 1000)
    this.scene.add(this.gridHelper)

    this.initialSetting()
  }

  private initialSetting() {
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)

    this.camera.position.set(0, 2, 5)

    // this.stats.showPanel(0)
    // this.stats.domElement.style.position = 'absolute'
    // this.stats.domElement.style.top = '0px'
    // document.body.append(this.stats.domElement)

    this.light.position.set(0, 20, 0)
    this.light.lookAt(new THREE.Vector3(0, 0, 0))
  }

  getCameraAngle() {
    const angle = this.camera.quaternion
    const rotate = new THREE.Euler().setFromQuaternion(angle, 'YXZ')

    return rotate
  }

  animate() {
    // this.stats.update()
    this.renderer.render(this.scene, this.camera)
  }
}
