const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const authRouter = require('./routes/auth.routes')
const corsMiddleware = require('./middleware/cors.middleware')

const app = express()
const PORT = config.get('serverPort')

app.use(corsMiddleware)
app.use(express.json()) //бо експрес не може розпарсити json рядок
app.use('/api/auth', authRouter)
const start = async () => {
  try {
    mongoose.connect(config.get('dbUrl'))
    app.listen(PORT, () => {
      console.log('Server has been started on port', PORT)
    })
  } catch (e) {
    console.log(e)
  }
}

start()
