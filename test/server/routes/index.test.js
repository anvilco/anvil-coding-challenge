const { expect } = require('chai')
const db = require('db')
const buildRoutes = require('server/routes')
const buildMockRouter = require('../buildMockRouter')

describe('routes', function () {
  let router, route, res, req
  beforeEach(async function () {
    req = {}
    res = {
      send: (value) => { res.body = value },
    }
    router = buildRoutes(buildMockRouter())
    db.resetToSeed()
  })

  describe('GET /api/files', function () {
    beforeEach(async function () {
      route = '/api/files'
    })

    it('returns all the files', async function () {
      await router.getRoutes[route](req, res)
      expect(res.body).to.have.length(5)
    })
  })

  describe('POST /api/files', function () {
    beforeEach(async function () {
      route = '/api/files'
      await router.getRoutes[route](req, res) // Call GET once
    })

    it('uploads a file and returns its metadata', async function () {
      const input = {
        description: 'A portait of an artist',
        file: {
          name: 'bobby-tables.jpg',
          mimetype: 'image/jpg',
          base64: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
        },
      }
      req.body = input
      await router.postRoutes[route](req, res)
      expect(res.body.id).to.be.ok
      expect(res.body.description).to.equal(input.description)
      expect(res.body.filename).to.equal(input.file.name)
      expect(res.body.mimetype).to.equal(input.file.mimetype)
      expect(res.body.src).to.equal(input.file.base64)
      expect(res.body.filename_hash).to.equal('72ac3ece33d8e923a41bb2a4410418a9cd023309720f03ebca286ad59b284d3d')
      expect(res.body.duplicate_count).to.equal(0)
    })

    it('if elvis.jpg exists, inputting elvis.jpg should set its name to elvis(1).jpg', async function () {
      const input = {
        description: 'test',
        file: {
          name: 'elvis.jpg',
          mimetype: 'image/jpg',
          base64: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
        },
      }
      req.body = input
      await router.postRoutes[route](req, res)
      expect(res.body.filename).to.equal('elvis(1).jpg')
    })

    it('if kitten.jpg, kitten(1).jpg, and kitten(2).jpg exists, inputting kitten.jpg should set its name to kitten(3).jpg', async function () {
      const input = {
        description: 'test',
        file: {
          name: 'kitten.jpg',
          mimetype: 'image/jpg',
          base64: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
        },
      }
      req.body = input
      await router.postRoutes[route](req, res)
      expect(res.body.filename).to.equal('kitten(3).jpg')
    })

    it('if dog(2).jpg exists, inputting dog.jpg should leave its name as is', async function () {
      const input = {
        description: 'test',
        file: {
          name: 'dog.jpg',
          mimetype: 'image/jpg',
          base64: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
        },
      }
      req.body = input
      await router.postRoutes[route](req, res)
      expect(res.body.filename).to.equal(input.file.name)
    })

    it('if kitten(1).jpg exists, inputting kitten(1).jpg should change its name to kitten(1)(1).jpg', async function () {
      const input = {
        description: 'test',
        file: {
          name: 'kitten(1).jpg',
          mimetype: 'image/jpg',
          base64: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
        },
      }
      req.body = input
      await router.postRoutes[route](req, res)
      expect(res.body.filename).to.equal('kitten(1)(1).jpg')
    })

    it('if kitten(1).jpg exists, inputting kitten(1).jpg should change its name to kitten(1)(1).jpg', async function () {
      const input = {
        description: 'test',
        file: {
          name: 'kitten(1).jpg',
          mimetype: 'image/jpg',
          base64: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
        },
      }
      req.body = input
      await router.postRoutes[route](req, res)
      expect(res.body.filename).to.equal('kitten(1)(1).jpg')
    })
  })
})
