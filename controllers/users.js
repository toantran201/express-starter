const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// Get all
usersRouter.get('/', async (req, res) => {
    const users = await User.find({}).populate('notes', {content: 1})
    res.json(users)
})

// Create new user
usersRouter.post('/', async (req, res) => {
    const {username, password, name} = req.body

    const existingUser = await User.findOne({username})
    if(existingUser){
        return res.status(400).json({
            error: 'Username must be unique'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = user.save()
    res.status(201).json(savedUser)
})

module.exports = usersRouter
