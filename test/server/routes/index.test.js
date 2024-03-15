const { expect } = require('chai')
const db = require('db')
const buildRoutes = require('server/routes')
const buildMockRouter = require('../buildMockRouter')
const FileRepository = require('db/repositories/fileRepository')

describe('routes', function () {
  let router, route, res, req, inputFile, totalSeedTestFiles

  const testBaseFileName = 'bobby-tables'
  const testFileExtension = 'jpg'
  const username = 'testuser'
  const fileRepository = new FileRepository(db.instance)

  function buildUploadData ({
    baseFileName=null,
    fileExt=null,
    base64=null,
    mimetype=null,
  }) {
    return {
      description: 'A portait of an artist',
      file: {
        name: `${baseFileName || testBaseFileName}.${fileExt || testFileExtension}`,
        mimetype: mimetype || 'image/jpg',
        base64: base64 || 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
      },
    }
  }

  function validateTest ({ inputFile, expectedFilename, responseBody }) {
    expect(responseBody.id).to.be.ok
    expect(responseBody.description).to.equal(inputFile.description)
    expect(responseBody.filename).to.equal(expectedFilename)
    expect(responseBody.mimetype).to.equal(inputFile.file.mimetype)
    expect(responseBody.src).to.equal(inputFile.file.base64)
  }

  beforeEach(async function () {
    req = {
      username,
    }
    res = {
      send: (value) => { res.body = value },
    }
    router = buildRoutes(buildMockRouter())
    db.resetToSeed()
  })

  describe('GET /api/files', function () {
    beforeEach(async function () {
      route = '/api/files'
      totalSeedTestFiles = fileRepository.getTotal()
    })

    it('returns all the files', async function () {
      await router.getRoutes[route](req, res)
      expect(res.body).to.have.length(totalSeedTestFiles)
    })

    it('returns 0 files for user with no uploads', async function () {
      req.username = 'test1'
      await router.getRoutes[route](req, res)
      expect(res.body).to.have.length(0)
    })
  })

  describe('POST /api/files', function () {
    beforeEach(async function () {
      route = '/api/files'
      inputFile = buildUploadData({})
    })

    it('uploads a file and returns its metadata', async function () {
      req.body = inputFile
      await router.postRoutes[route](req, res)

      validateTest({
        inputFile,
        expectedFilename: inputFile.file.name,
        responseBody: res.body,
      })
    })
  })
})
