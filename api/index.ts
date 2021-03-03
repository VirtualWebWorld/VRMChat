import express from 'express'
import { Server, Socket } from 'socket.io'
import { VRMData, VRMState } from '../domain'

const app = express()
const server = app.listen(8000)
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://vrmchat.aktk1910.pw',
      'https://vrmchat.herokuapp.com',
    ],
    methods: ['GET', 'POST'],
  },
})

const socketArr = new Map<string, VRMData>()

io.on('connection', (socket: Socket) => {
  console.log(`socket_id: ${socket.id} is connected.`)

  socket
    .on('join-ping', () => {
      console.log('j', socket.id)
      const sa = []
      for (const value of socketArr.values()) {
        sa.push(value)
      }
      socket.emit('join-pong', sa)
    })
    // .on('send-msg', (msg: any) => {
    //   socket.broadcast.emit('new-msg', msg)
    //   console.log(`receive message: ${JSON.stringify(msg)}`)
    // })
    .on('send-vrm', (data: VRMData) => {
      socketArr.set(socket.id, data)
      console.log('member', socketArr.size)
      socket.broadcast.emit('new-vrm', data)
    })
    .on('send-vrm-data', (data: VRMState) => {
      socket.broadcast.emit('new-vrm-data', data)
    })
    .on('disconnect', () => {
      socket.broadcast.emit('old-vrm', socketArr.get(socket.id))
      socketArr.delete(socket.id)
      console.log('d', socket.id)
    })
})

// server.listen(8000)

module.exports = {
  path: '/',
  handler: app,
}
