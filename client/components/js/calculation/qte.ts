import * as THREE from 'three'

// Quaternion to Euler
const qte = (q: THREE.Quaternion): { x: number; y: number; z: number } => {
  const x = q.x
  const y = q.y
  const z = q.z
  const w = q.w

  const x2 = x * x
  const y2 = y * y
  const z2 = z * z

  const xy = x * y
  const xz = x * z
  const yz = y * z
  const wx = w * x
  const wy = w * y
  const wz = w * z

  const m00 = 1 - 2 * y2 - 2 * z2
  const m01 = 2 * xy + 2 * wz
  const m10 = 2 * xy - 2 * wz
  const m11 = 1 - 2 * x2 - 2 * z2
  const m20 = 2 * xz + 2 * wy
  const m21 = 2 * yz - 2 * wx
  const m22 = 1 - 2 * x2 - 2 * y2

  let tx, ty, tz

  if (Math.floor(m21) === 1) {
    tx = Math.PI / 2
    ty = 0
    tz = Math.atan2(m10, m00)
  } else if (Math.floor(m21) === -1) {
    tx = -Math.PI / 2
    ty = 0
    tz = Math.atan2(m10, m00)
  } else {
    tx = Math.asin(-m21)
    ty = Math.atan2(m20, m22)
    tz = Math.atan2(m01, m11)
  }
  return { x: tx, y: ty, z: tz }
}

export default qte
