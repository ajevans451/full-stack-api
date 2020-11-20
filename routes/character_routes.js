const express = require('express')
const passport = require('passport')
const router = express.Router()

const Character = require('./../models/character')
const User = require('../models/user')
// custom errors
const customErrors = require('./../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const requireToken = passport.authenticate('bearer', { session: false })
router.post('/characters', requireToken, (req, res, next) => {
  console.log("character creation router called")
  // first, find the user using their token
  // const userToken = req.header.token
  // console.log(userToken)
  // User.findOne({ 'token': userToken }, '_id', function(err, foundUser){
  //   console.log('found user:')
  //   console.log(foundUser)
      // user was found.  good.
      // now perform the action (create character) using the request data.
      //})
    const charInfo = req.body.character
    charInfo.owner = req.user.id
      //console.log('character data:')
      //console.log(charInfo)
    // charInfo.owner = foundUser._id
      //console.log('full character info:')
      //console.log(charInfo)
    Character.create(charInfo)
        //.then(character => res.status(201).json({ character }))
        //.then(character => console.log(character))
      .then(character => res.status(201).json({ character: character }))
      .catch(next)
    console.log("done with character creation router")
  //const charInfo = req.body.character
  // console.log(charInfo)
  //charInfo.owner = foundUser._id
})
router.get('/characters', requireToken, (req, res, next) => {
  console.log("character index router called")
  console.log(req.user.id)
  // get the user (owner) id
  // pass that owner id to the find so the user's characters can be found
  Character.find({ owner: req.user.id })
    .populate('owner')
    .then(char => res.status(206).json(char))
    .catch(next)
})
router.patch('/characters/:id', requireToken, (req, res, next) => {
  console.log("character update router called")
  delete req.body.character.owner
  const charId = req.params.id
  console.log('this is: ' + charId)
  Character.findById(charId)
    .then(handle404)
    // .then(character => requireOwnership(req, character))
    // .then(character => character.updateOne(req.body.character))
    .then(character => {
      // console.log('test', customErrors)
      requireOwnership(req, character)
      return character.updateOne(req.body.character)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})
// router.get('/characters/:id', requireToken, (req, res, next) => {
//   console.log("character show router called")
//   const charId = req.params.character.id
//   Character.findById(charId)
//     .then(handle404)
//     .then(character => res.json({ character: character.toObject() }))
//     .catch(next)
// })
router.delete('/characters/:id', requireToken, (req, res, next) => {
  console.log("character delete router called")
  const charId = req.params.id
  Character.findById(charId)
    .then(handle404)
    .then(character => {
      character.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})
module.exports = router
