const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helpers')
const app = require('../app')

const api = supertest(app)
const Note = require('../models/note')

beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes)
})

// Get all
describe('When there is init some notes saved', () => {
    test('Noted are returned as json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    }, 100000)

    test('All notes are returned', async () => {
        const response = await api.get('/api/notes')
        expect(response.body).toHaveLength(helper.initialNotes.length)
    })

    test('A specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')
        const contents = response.body.map(r => r.content)
        expect(contents).toContain(
            'Browser can execute only Javascript'
        )
    })
})

// Get specific
describe('Viewing a specific note', () => {
    test('Succeeds with a valid id', async () => {
        const notesAtStart = await helper.getAllNotes()
        const noteToView = notesAtStart[0]

        const resultNote = await api
            .get(`/api/notes/${noteToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
        expect(resultNote.body).toEqual(processedNoteToView)
    })

    test('Fail with status code 404 if note does note exist', async () => {
        const validNonExistingId = await helper.nonExistingId()
        await api
            .get(`/api/notes/${validNonExistingId}`)
            .expect(404)
    })

    test('Fail with status code 400 if id is invalid', async () => {
        const inValidId = '342564sad12e6'

        await api
            .get(`/api/notes/${inValidId}`)
            .expect(400)
    })
})

// Add note
describe('Addition of a new node', () => {
    test('Add note success with valid data', async () => {
        const newNote = {
            content: 'A new note will be added',
            important: true
        }

        await api
            .post(`/api/notes`)
            .send(newNote)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const allNotes = await helper.getAllNotes()
        expect(allNotes).toHaveLength(helper.initialNotes.length + 1)

        const contents = allNotes.map(note => note.content)
        expect(contents).toContain('A new note will be added')
    })

    test('Add note fail with invalid data', async () => {
        const newNote = {
            important: true
        }

        await api
            .post(`/api/notes`)
            .send(newNote)
            .expect(400)

        const allNotes = await helper.getAllNotes()
        expect(allNotes).toHaveLength(helper.initialNotes.length)
    })
})

//Delete
describe('Delete one note', () => {
    test('Delete one note success and return code 204', async () => {
        const allNotesBefore = await helper.getAllNotes()
        const validNoteToDelete = allNotesBefore[0]

        await api
            .delete(`/api/notes/${validNoteToDelete.id}`)
            .expect(204)

        const allNotesAfter = await helper.getAllNotes()
        expect(allNotesAfter).toHaveLength(allNotesBefore.length - 1)

        const contents = allNotesAfter.map(note => note.content)
        expect(contents).not.toContain(validNoteToDelete.content)
    })
})

afterAll(() => {
    mongoose.connection.close()
})
