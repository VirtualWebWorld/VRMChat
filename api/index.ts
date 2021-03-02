import http from 'http'
const app = require('express')()
const server = http.createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
})

const socketArr = new Map()

io.on('connection', (socket: any) => {
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
    .on('send-msg', (msg: any) => {
      socket.broadcast.emit('new-msg', msg)
      console.log(`receive message: ${JSON.stringify(msg)}`)
    })
    .on('send-vrm', (data: any) => {
      socketArr.set(socket, data)
      console.log('member', socketArr.size)
      socket.broadcast.emit('new-vrm', data)
    })
    .on('send-vrm-data', (data: any) => {
      socket.broadcast.emit('new-vrm-data', data)
    })
    .on('disconnect', () => {
      socket.broadcast.emit('old-vrm', socketArr.get(socket))
      socketArr.delete(socket)
      console.log('d', socket.id)
    })
})

server.listen(8000)

module.exports = {
  path: '/',
  handler: app,
}