const express = require('express')
const passport = require('passport')
const router = express.Router()
const Character = require('../models/character')
const customErrors = require('./../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const requireToken = passport.authenticate('bearer', { session: false })
router.post('/characters', (req, res, next) => {
  const charInfo = req.body.character
  charInfo.owner = req.user.id
  Character.create(charInfo)
    .then(character => res.status(201).json({ character }))
    .catch(next)
})
router.get('/characters', requireToken, (req, res, next) => {
  Character.find()
    .populate('owner')
    .then(char => res.status(206).json(char))
    .catch(next)
})
router.patch('/characters/:id', requireToken, (req, res, next) => {
  delete req.body.character.owner
  const charId = req.params.id
  Character.findById(charId)
    .then(handle404)
    .then(character => requireOwnership(req, character))
    .then(character => character.updateOne(req.body.character))
    .then(() => res.sendStatus(204))
    .catch(next)
})
router.get('/characters/:character_id', requireToken, (req, res, next) => {
  const charId = req.params.character_id
  Character.findById(charId)
    .then(handle404)
    .then(character => res.json({ character: character.toObject() }))
    .catch(next)
})
router.delete('/characters/:character_id', requireToken, (req, res, next) => {
  const charId = req.params.character_id
  Character.findById(charId)
    .then(handle404)
    .then(character => {
      character.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})
module.exports = router
