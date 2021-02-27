const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket: any) => {
  console.log(`socket_id: ${socket.id} is connected.`)

  socket.on('send-msg', (msg: any) => {
    socket.broadcast.emit('new-msg', msg)
    console.log(`receive message: ${JSON.stringify(msg)}`)
  })
})

server.listen(8000)
