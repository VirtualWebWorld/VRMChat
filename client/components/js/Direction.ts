import { Vector2 } from 'three'

export default class Direction {
  x: -1 | 0 | 1 = 0
  y: -1 | 0 | 1 = 0
  keyArr: { [key: string]: boolean } = {
    front: false,
    back: false,
    right: false,
    left: false,
  }

  moveFront() {
    this.y += 1
  }

  moveBack() {
    this.y += -1
  }

  moveRight() {
    this.x += 1
  }

  moveLeft() {
    this.x += -1
  }

  toVector2(): Vector2 {
    this.x = this.y = 0
    if (this.keyArr.front) this.moveFront()
    if (this.keyArr.back) this.moveBack()
    if (this.keyArr.right) this.moveRight()
    if (this.keyArr.left) this.moveLeft()
    return new Vector2(this.x, this.y).normalize()
  }
}
