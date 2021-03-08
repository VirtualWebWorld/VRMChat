import express from 'express'
import { Server, Socket } from 'socket.io'
import { VRMData, VRMState } from '../../client/domain'
import path from 'path'
import multer from 'multer'
import { Response } from 'express-serve-static-core'

const app = express()
const port = process.env.PORT || 8000
const server = app.listen(port, () => {
  console.log(`Node.js is listening to PORT: ${port}`)
})

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:8000',
      'http://localhost:3000',
      'http://vrmchat.aktk1910.pw',
    ],
    methods: ['GET', 'POST'],
  },
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'models'))
  },
  filename: function (req, file, cb) {
    cb(null, '' + req.body.fileName + '.vrm')
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
      for (const [id, value] of socketArr) {
        if (id !== socket.id) {
          sa.push(value)
        }
      }
      socket.emit('join-pong', sa)
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
  .use('/', express.static(path.join(__dirname, '../../client/dist')))
  .post('/upload', upload.single('file'), (req, res) => {
    console.log(req.body.fileName)
    if (!req.file) {
      res.status(400).send('No file uploaded.')
      return
    }
    const fileName = req.file.filename.split('.')[0]
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
  .use((req, res, next) => {
    res.status(404).send('Sorry cant find that!')
  })

module.exports = {
  path: '/',
  handler: app,
}
