import express from 'express'
import { Server, Socket } from 'socket.io'
import { VRMData, VRMState } from '../../client/domain'
import path from 'path'
import multer from 'multer'
import { Response } from 'express-serve-static-core'
import bodyParser from 'body-parser'

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

function randomString() {
  return Math.random().toString(36).slice(-8)
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'models'))
  },
  filename: function (req, file, cb) {
    cb(null, '' + randomString() + '.vrm')
  },
})
const upload = multer({ storage: storage })

// connection data
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

function endRes(res: Response<any, Record<string, any>, number>) {
  res.writeHead(301, {
    Location: '/',
  })
  res.end()
}

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(bodyParser.json())

app
  .use('/', express.static(path.join(__dirname, '../../client/dist')))
  .post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).send('No file uploaded.')
      return
    }
    const fileName = req.file.filename.split('.')[0]
    res.send(fileName + 'ファイルのアップロードが完了しました。')
    // endRes(res)
  })
  .get('/models/:file', (req, res) => {
    const file = req.params.file
    res.sendFile(`${__dirname}/models/${file}`)
  })
  .use((req, res, next) => {
    res.status(404).send('Sorry cant find that!')
  })

module.exports = {
  path: '/',
  handler: app,
}
