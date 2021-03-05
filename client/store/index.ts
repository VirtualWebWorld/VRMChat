import { io, Socket } from 'socket.io-client'
export const strict = false

interface State {
  load: number
  socket: Socket
  commentFlag: boolean
  isLoad: boolean
}

export const state = (): State => ({
  load: 0,
  socket: io(`${process.env.baseUrl}`),
  commentFlag: false,
  isLoad: false,
})

export const mutations = {
  loadCount: (state: any, num: number) => {
    state.load = num
  },
  isComment: (state: any, flag: boolean) => {
    state.commentFlag = flag
  },
  loadFlag: (state: any, flag: boolean) => {
    state.isLoad = flag
  },
}

export const getters = {
  load: (state: State) => {
    return state.load
  },
  socket: (state: State) => {
    return state.socket
  },
  commentFlag: (state: State) => {
    return state.commentFlag
  },
  isLoad: (state: State) => {
    return state.isLoad
  },
}
