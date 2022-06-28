require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
// Utils
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
//Controller
const notesRouter = require('./controllers/notes')

// Connect DB
mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })

const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())
app.use(express.static('dist'))

app.get('/', (req, res) => {
    res.send('<h1>Welcome to hello-world app</h1>')
})

// Notes
app.use('/api/notes', notesRouter)

// handler of requests with unknown endpoint
app.use(middleware.unknownEndpoint)

// Error handler middleware - should be the last loaded middleware
app.use(middleware.errorHandler)

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})
