import { io, Socket } from 'socket.io-client'

interface State {
  load: number
  socket: Socket
}

export const state = (): State => ({
  load: 0,
  socket: io(`${process.env.baseUrl}`),
})

export const mutations = {
  loadCount: (state: any, num: number) => {
    state.load = num
  },
}

export const getters = {
  load: (state: State) => {
    return state.load
  },
  socket: (state: State) => {
    return state.socket
  },
}
