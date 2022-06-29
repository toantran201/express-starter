const bcrypt = require('bcrypt')
const supertest = require("supertest");
//
const helper = require('./user_test_helper')
const User = require('../models/user')
const app = require('../app')
const mongoose = require("mongoose");
//
const api = supertest(app)

describe('When there is init one user in DB', () => {
    beforeEach(async() => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('password', 10)
        const user = new User({username: 'root', passwordHash})

        await user.save()
    })

    test('Create succeed with valid user', async () => {
        const allUsersBefore = await helper.getAllUsers()

        const newUser = {
            username: 'toantran201',
            name: 'Duc Toan Tran',
            password: '123456'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const allUsersAfter = await helper.getAllUsers()
        expect(allUsersAfter).toHaveLength(allUsersBefore.length + 1)

        const usernames = allUsersAfter.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('Create fail with status code 400 and message if username already exist', async () => {
        const allUsersBefore = await helper.getAllUsers()
        const newUser = {
            username: 'root',
            name: 'Duc Toan Tran',
            password: '123456'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('Username must be unique')

        const allUserAfter = await helper.getAllUsers()
        expect(allUserAfter).toEqual(allUsersBefore)
    })
})

afterAll(() => {
    mongoose.connection.close()
})
