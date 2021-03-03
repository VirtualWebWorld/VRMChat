import { Vector2 } from 'three'

export default class Direction {
  x: -1 | 0 | 1 = 0
  y: -1 | 0 | 1 = 0

  moveFront() {
    this.x = 1
  }

  moveBack() {
    this.x = -1
  }

  moveRight() {
    this.y = 1
  }

  moveLeft() {
    this.y = -1
  }

  stop() {
    this.x = 0
    this.y = 0
  }

  stopX() {
    this.x = 0
  }

  stopY() {
    this.y = 0
  }

  toVector2(): Vector2 {
    return new Vector2(this.x, this.y).normalize()
  }
}
