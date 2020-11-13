process.env.TESTENV = true

let Character = require('../models/character.js')
let User = require('../models/user')

const crypto = require('crypto')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
chai.should()

chai.use(chaiHttp)

const token = crypto.randomBytes(16).toString('hex')
let userId
let charId

describe('Characters', () => {
  const characterParams = {
    title: '13 JavaScript tricks SEI instructors don\'t want you to know',
    text: 'You won\'believe number 8!'
  }

  before(done => {
    Character.deleteMany({})
      .then(() => User.create({
        email: 'caleb',
        hashedPassword: '12345',
        token
      }))
      .then(user => {
        userId = user._id
        return user
      })
      .then(() => Character.create(Object.assign(characterParams, {owner: userId})))
      .then(record => {
        charId = record._id
        done()
      })
      .catch(console.error)
  })

  describe('GET /characters', () => {
    it('should get all the characters', done => {
      chai.request(server)
        .get('/characters')
        .set('Authorization', `Token token=${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.characters.should.be.a('array')
          res.body.characters.length.should.be.eql(1)
          done()
        })
    })
  })

  describe('GET /characters/:id', () => {
    it('should get one character', done => {
      chai.request(server)
        .get('/characters/' + charId)
        .set('Authorization', `Token token=${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.character.should.be.a('object')
          res.body.character.title.should.eql(characterParams.title)
          done()
        })
    })
  })

  describe('DELETE /characters/:id', () => {
    let charId

    before(done => {
      Character.create(Object.assign(characterParams, { owner: userId }))
        .then(record => {
          charId = record._id
          done()
        })
        .catch(console.error)
    })

    it('must be owned by the user', done => {
      chai.request(server)
        .delete('/characters/' + charId)
        .set('Authorization', `Bearer notarealtoken`)
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should be succesful if you own the resource', done => {
      chai.request(server)
        .delete('/characters/' + charId)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('should return 404 if the resource doesn\'t exist', done => {
      chai.request(server)
        .delete('/characters/' + charId)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(404)
          done()
        })
    })
  })

  describe('POST /characters', () => {
    it('should not POST an character without a title', done => {
      let noTitle = {
        text: 'Untitled',
        owner: 'fakedID'
      }
      chai.request(server)
        .post('/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ character: noTitle })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          done()
        })
    })

    it('should not POST an character without text', done => {
      let noText = {
        title: 'Not a very good character, is it?',
        owner: 'fakeID'
      }
      chai.request(server)
        .post('/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ character: noText })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          done()
        })
    })

    it('should not allow a POST from an unauthenticated user', done => {
      chai.request(server)
        .post('/characters')
        .send({ character: characterParams })
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should POST an character with the correct params', done => {
      let validcharacter = {
        title: 'I ran a shell command. You won\'t believe what happened next!',
        text: 'it was rm -rf / --no-preserve-root'
      }
      chai.request(server)
        .post('/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ character: validcharacter })
        .end((e, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('character')
          res.body.character.should.have.property('title')
          res.body.character.title.should.eql(validcharacter.title)
          done()
        })
    })
  })

  describe('PATCH /characters/:id', () => {
    let charId

    const fields = {
      title: 'Find out which HTTP status code is your spirit animal',
      text: 'Take this 4 question quiz to find out!'
    }

    before(async function () {
      const record = await Character.create(Object.assign(characterParams, { owner: userId }))
      charId = record._id
    })

    it('must be owned by the user', done => {
      chai.request(server)
        .patch('/characters/' + charId)
        .set('Authorization', `Bearer notarealtoken`)
        .send({ character: fields })
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should update fields when PATCHed', done => {
      chai.request(server)
        .patch(`/characters/${charId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ character: fields })
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('shows the updated resource when fetched with GET', done => {
      chai.request(server)
        .get(`/characters/${charId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.character.title.should.eql(fields.title)
          res.body.character.text.should.eql(fields.text)
          done()
        })
    })

    it('doesn\'t overwrite fields with empty strings', done => {
      chai.request(server)
        .patch(`/characters/${charId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ character: { text: '' } })
        .then(() => {
          chai.request(server)
            .get(`/characters/${charId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((e, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              // console.log(res.body.character.text)
              res.body.character.title.should.eql(fields.title)
              res.body.character.text.should.eql(fields.text)
              done()
            })
        })
    })
  })
})
