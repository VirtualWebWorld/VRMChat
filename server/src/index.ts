import express from 'express'
import { Server, Socket } from 'socket.io'
import { Message, VRMData, VRMState } from '../../client/domain'
import path from 'path'
import multer from 'multer'
import fs from 'fs'
import { Response } from 'express-serve-static-core'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = process.env.PORT || 8000
const server = app.listen(port, () => {
  console.log(`Node.js is listening to PORT: ${port}`)
})

// development
let corsOption = {}
if (process.env.NODE_ENV === 'development') {
  corsOption = {
    cors: {
      origin: ['http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  }

  // localhost cors
  app.use((req, res, next): void => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, access_token'
    )

    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
      res.send(200)
    } else {
      next()
    }
  })
}

const io = new Server(server, corsOption)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'models'))
  },
  filename: function (req, file, cb) {
    cb(null, `${req.body.fileName}.vrm`)
  },
})
const upload = multer({ storage: storage })

// connection data
const socketArr = new Map<string, VRMData>()
const defaultAvatarName = 'three-vrm-girl'

io.on('connection', (socket: Socket) => {
  console.log(`socket_id: ${socket.id} is connected.`)

  socket
    //test
    .on('tping', () => {
      console.log('tping')
    })

    //login
    .on('join-ping', () => {
      console.log('j', socket.id)
      const sa = []
      for (const [id, value] of socketArr) {
        if (id !== socket.id) {
          sa.push(value)
        }
      }
      socket.emit('join-pong', sa)

      const message: Message = {
        name: 'Announcement',
        text: 'Connect: ' + socketArr.get(socket.id)?.name,
        color: '#FF0000',
      }
      socket.emit('new-msg', message)
      socket.broadcast.emit('new-msg', message)
    })

    //vrm
    .on('send-vrm', (socketId: string) => {
      const data = socketArr.get(socketId)
      console.log('member', socketArr.size)
      socket.broadcast.emit('new-vrm', data)
    })
    .on('send-vrm-data', (data: VRMState) => {
      socket.broadcast.emit('new-vrm-data', data)
    })
    .on('logout', () => {
      deleteData(socket)
    })

    //message
    .on('send-msg', (msg: Message) => {
      socket.broadcast.emit('new-msg', msg)
      console.log(`receive message: ${JSON.stringify(msg)}`)
    })

    //disconnect
    .on('disconnect', () => {
      deleteData(socket)
    })
})

function deleteData(socket: Socket) {
  const socketData = socketArr.get(socket.id)
  if (socketData !== undefined) {
    const message: Message = {
      name: 'Announcement',
      text: 'Disconnect: ' + socketData.name,
      color: '#FF0000',
    }
    socket.broadcast.emit('new-msg', message)

    socket.broadcast.emit('old-vrm', socketData)
    if (socketData.vrm !== defaultAvatarName) {
      fs.unlinkSync(__dirname + '/models/' + socketData.vrm + '.vrm')
    }
    socketArr.delete(socket.id)
    console.log('d', socket.id)
  }
}

function endRes(res: Response) {
  // res.writeHead(301, {
  //   Location: 'http://localhost:8000/',
  // })
  res.end()
}

app.use(
  express.urlencoded({
    extended: true,
  })
)
app.use(express.json())

app
  // .use('/', express.static(path.join(__dirname, '../../client/dist')))
  .post('/upload', upload.single('file'), (req, res) => {
    if (!req.file && req.body.fileName !== defaultAvatarName) {
      res.status(400).send('No file uploaded.')
      return
    }

    const fileName = req.body.fileName

    const data: VRMData = {
      id: req.body.id,
      name: req.body.name,
      vrm: fileName,
    }
    socketArr.set(req.body.id, data)
    console.log('Upload file: ' + fileName)
    endRes(res)
  })
  .get('/models/:file', (req, res) => {
    const file = req.params.file
    res.sendFile(`${__dirname}/models/${file}`)
  })

  // 404 error
  .use((req, res) => {
    res.status(404).send('Sorry cant find that!')
  })

module.exports = {
  path: '/',
  handler: app,
}
