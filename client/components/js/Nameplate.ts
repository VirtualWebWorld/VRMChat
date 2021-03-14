import * as PIXI from 'pixi.js'
import * as THREE from 'three'

export default class NamePlate {
  textStyle: PIXI.TextStyle

  constructor() {
    PIXI.TextMetrics.BASELINE_SYMBOL = 'あ|'

    this.textStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fill: 'white',
      fontWeight: 'bold',
    })
  }

  namePlate(name: string) {
    const stage = new PIXI.Container()
    const tSize = PIXI.TextMetrics.measureText(name, this.textStyle)
    const width = tSize.width
    const height = tSize.height
    const renderer = PIXI.autoDetectRenderer({
      width,
      height,
      resolution: 1,
      antialias: true,
      backgroundAlpha: 0,
    })

    this.nameAdd(name, tSize, stage)
    renderer.render(stage)

    const canvasTexture = new THREE.CanvasTexture(renderer.view)
    const spriteMaterial = new THREE.SpriteMaterial({ map: canvasTexture })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.y = height / width
    return sprite
  }

  nameAdd(name: string, tSize: PIXI.TextMetrics, stage: PIXI.Container) {
    const textObj = new PIXI.Text(name, this.textStyle)
    textObj.anchor.set(0.5)
    textObj.x = tSize.width / 2
    textObj.y = tSize.height / 2
    stage.addChild(textObj)
  }
}
