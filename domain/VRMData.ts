import { VRM } from '@pixiv/three-vrm'

export default interface VRMData {
  id: string
  name: string
  vrm: VRM | null
}
