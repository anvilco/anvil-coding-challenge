const db = require('db')
const FileRepository = require('db/repositories/fileRepository')

// SQLite usage
// https://github.com/WiseLibs/better-sqlite3
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md

function buildRoutes (router) {
  const fileRepository = new FileRepository(db.instance)

  router.get('/api/username', async (req, res) => {
    return res.send({ username: req.username })
  })

  router.get('/api/files', async (req, res) => {
    const files = fileRepository.getUserFiles({ username: req.username })
    return res.send(files)
  })

  router.post('/api/files', async (req, res) => {
    const username = req.username
    const { description, file } = req.body

    const newFile = fileRepository.insertFile({
      description,
      filename: file.name,
      mimetype: file.mimetype,
      src: file.base64,
      username,
    })
    return res.send(newFile)
  })

  return router
}

module.exports = buildRoutes
