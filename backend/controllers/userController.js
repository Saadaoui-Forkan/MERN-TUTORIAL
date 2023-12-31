const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const User = require('../models/userModel')

// @desc Register New User
// @route POST api/users
// @access Public
const registerUser = asyncHandler (async (req, res) => {
    const {name, email, password} = req.body

    if (!name || !email || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check if user exists
    const userEsists = await User.findOne({email})
    if (userEsists) {
        res.status(400)
        throw new Error('User already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create a user
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })
    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } else{
        res.status(400)
        throw new Error ('Invalid user data')
    }
})

// @desc Authenticate a user
// @route POST api/users/login
// @access Public
const loginUser = asyncHandler (async (req, res) => {
    const {email, password} = req.body

    // Check for user email
    const user = await User.findOne({email})
    const comparePassword = await bcrypt.compare(password, user.password)

    if ( user && comparePassword ) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } else{
        res.status(400)
        throw new Error ('Invalid email or password')
    }
})

// @desc Get User Data
// @route GET api/users/me
// @access Public
const getMe = asyncHandler (async (req, res) => {
    const {_id, email, name} = await User.findOne(req.user.id)

    res.status(200).json({
        id: _id,
        name,
        email
    })
})

// Generate a token
const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: '30d'
    })
}

module.exports = { registerUser, loginUser, getMe }