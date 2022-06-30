const jwt = require('jsonwebtoken')
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const {response} = require("express");

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}


notesRouter.get('/', async (req, res) => {
    const notes = await Note.find({})
    res.json(notes)
})

notesRouter.get('/:id', async (req, res, next) => {
    const note = await Note.findById(req.params.id)
    if (note) {
        res.json(note)
    } else {
        res.status(404).end()
    }
})

notesRouter.post('/', async (req, res, next) => {
    const body = req.body

    //
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    console.log(decodedToken)
    if(!decodedToken.id){
        return response.status(401).json({error: 'Token missing or invalid'})
    }
    //
    const user = await User.findById(body.userId)

    if(!body.constructor){
        res.status(400).end()
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
        user: user._id
    })

    const savedNote = await note.save()

    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    res.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (req, res, next) => {
    await Note.findByIdAndRemove(req.params.id)
    res.status(204).end()
})

notesRouter.put('/:id', (req, res, next) => {
    const body = req.body

    const note = {
        content: body.content,
        important: body.important,
    }

    Note.findByIdAndUpdate(req.params.id, note, {new: true})
        .then(updatedNote => {
            res.json(updatedNote)
        })
        .catch(error => next(error))
})

module.exports = notesRouter
