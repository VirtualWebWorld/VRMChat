import express from 'express'
import { Server, Socket } from 'socket.io'
import { VRMData, VRMState } from '../../client/domain'
import path from 'path'

const app = express()
const port = process.env.PORT || 8000
const server = app.listen(port, () => {
  console.log(`Node.js is listening to PORT: ${port}`)
})

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
    //login
    .on('join-ping', () => {
      console.log('j', socket.id)
      const sa = []
      for (const value of socketArr.values()) {
        sa.push(value)
      }
      socket.emit('join-pong', sa)
    })

    //vrm
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

    //message
    .on('send-msg', (msg: any) => {
      socket.broadcast.emit('new-msg', msg)
      console.log(`receive message: ${JSON.stringify(msg)}`)
    })
})

app.use(express.static(path.join(__dirname, '../../client/dist')))
// server.listen(8000)

module.exports = {
  path: '/',
  handler: app,
}
