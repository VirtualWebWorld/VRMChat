import * as THREE from 'three'

export default interface VRMState {
  id: string
  vrmData: THREE.Scene | THREE.Group
}
