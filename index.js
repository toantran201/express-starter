require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Note = require('./model/note')

const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())
app.use(express.static('dist'))

app.get('/', (req, res) => {
  res.send('<h1>Welcome to hello-world app</h1>')
})

// Notes
app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  }).catch(err => {
    console.log({ err })
  })
})

app.get('/api/notes/:id', (req, res, next) => {
  Note.findById(req.params.id)
    .then(note => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/notes', (req, res, next) => {
  const body = req.body
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save()
    .then(savedNote => {
      res.json(savedNote)
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (req, res, next) => {
  const { content, important } = req.body


  Note.findByIdAndUpdate(
    req.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedNote => {
      res.json(updatedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(result => {
      console.log(result)
      res.status(204).end()
    })
    .catch(err => next(err))
})

// handler of requests with unknown endpoint
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// Error handler middleware - should be the last loaded middleware
const errorHandler = (error, req, res, next) => {
  console.error(error)

  switch (error.name){
  case 'CastError': return res.status(400).send({ error: 'malformatted id' })
  case 'ValidationError': return res.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
