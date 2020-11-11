const express = require('express')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const passport = require('passport')
// custom ERRORS
const customErrors = require('../lib/custom_errors')
const handle404 = customErrors.handle404
const BadParamsError = customErrors.BadParamsError
const BadCredentialsError = customErrors.BadCredentialsError
// define router
const router = express.Router()
const User = require('../models/user')
const requireToken = passport.authenticate('bearer', { session: false })

router.post('/sign-up', (req, res, next) => {
  console.log(" sign-up router called")
  const creds = req.body.credentials
  Promise.resolve(creds)
    .then(console.log('router promise resolving'))
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
        hashedPassword: hash,
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
  console.log(" sign-in router called")
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
  console.log(" change-PW router called")
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
  console.log(" sign-out router called")
  req.user.token = crypto.randomBytes(16)
  req.user.save()
    .then(() => res.sendStatus(204))
    .catch(next)
})
module.exports = router
