const express = require('express')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const passport = require('passport')
const requireToken = passport.authenticate('bearer', { session: false })
const User = require('../models/user')
const router = express.Router()
router.post('/sign-up', (req, res, next) => {
  const creds = req.body.credentials
  Promise.resolve(creds)
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
      if (correctPW) {
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
router.patch('/change-password', requireToken, (req, res, next) => {
  let user
  User.findById(req.user.id)
    .then(foundUser => {
      if (!foundUser) {
        throw new Error('User not found')
      }
      user = foundUser
      return bcrypt.compare(req.body.passwords.old, user.hashedPassword)
    })
    .then(correctPW => {
      if (!correctPW || !req.body.passwords.new) {
        throw new Error('Omitted or invalid params')
      }
      return bcrypt.hash(req.body.passwords.new, 12)
    })
    .then(hash => {
      user.hashedPassword = hash
      return user.save()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})
router.delete('/sign-out', requireToken, (req, res, next) => {
  req.user.token = crypto.randomBytes(16)
  req.user.save()
    .then(() => res.sendStatus(204))
    .catch(next)
})
module.exports = router
