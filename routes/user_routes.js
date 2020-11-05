const express = require('express')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const User = require('../models/user')
const router = express.Router()
router.post('/sign-up', (req, res, next) => {
  const creds = req.body.credentials
  Promise.resolve()
    .then(() => {
      if (!creds || !creds.password || creds.password !== creds.password_confirmation) {
        throw new Error('Omitted or invalid parameter')
      }
    })
    .then(() => {
      return bcrypt.hash(creds.password, 12)
    })
    .then(hash => {
      const user = {
        hashedPW: hash,
        email: creds.email
      }
      return User.create(user)
    })
    .then(user => {
      res.status(201).json({ user: user.toObject() })
    })
    .catch(next)
})
router.post('/sign-in', (req, res, next) => {
  const password = req.body.credentials.password
  let user
  User.findOne({ email: req.body.credentials.email })
    .then(foundUser => {
      if (!foundUser) {
        throw new Error('User not found')
      }
      user = foundUser
      return bcrypt.compare(password, user.hashedPassword)
    })
    .then(correctPW => {
      if(correctPW) {
        const token = crypto.randomBytes(16).toString('hex')
        user.token = token
        return user.save()
      } else {
        throw new Error('Invalid email or password')
      }
    })
    .then(savedUser => {
      res.status(201).json({ user: user.toObject() })
    })
    .catch(next)
})
