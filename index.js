require('dotenv').config()
const express = require('express')
const morgan = require("morgan")
const cors = require('cors')
const Note = require("./model/note");

const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())
app.use(express.static('dist'))

let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2022-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2022-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2022-05-30T19:20:14.298Z",
        important: true
    }
]

app.get('/', (req, res) => {
    res.send(`<h1>Welcome to hello-world app</h1>`)
})

// Notes
app.get('/api/notes', (req, res) => {
    Note.find({}).then(notes => {
        res.json(notes)
    }).catch(err => {
        console.log({err})
    })
})

app.get('/api/notes/:id', (req, res) => {
    Note.findById(req.params.id)
        .then(note => {
            if (note) {
                res.json(note)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => {
            console.log(error)
            res.status(400).send({error: 'Malformed Id'})
        })
})

app.post('/api/notes', (req, res) => {
    const body = req.body

    if (!body.content) {
        return res.status(400).json({
            error: 'Content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })

    note.save().then(savedNote => {
        res.json(savedNote)
    })
})

app.delete('/api/notes/:id', (req, res) => {
    const id = Number(req.params.id)
    notes = notes.filter(note => note.id !== id)

    res.status(204).end()
})


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
