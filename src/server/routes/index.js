const os = require('os')
const db = require('db')

// SQLite usage
// https://github.com/WiseLibs/better-sqlite3
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md

function buildRoutes (router) {
  router.get('/api/username', async (req, res) => {
    return res.send({ username: os.userInfo().username })
  })

  router.get('/api/files', async (req, res) => {
    const files = db.instance
      .prepare(`
        SELECT * FROM files
      `)
      .all() // use .get() to fetch a single row
    return res.send(files)
  })

  router.post('/api/files', async (req, res) => {
    const { description, file } = req.body
    const newFile = db.instance
      .prepare(`
        INSERT INTO files
          (description, filename, mimetype, src)
          VALUES
          (@description, @filename, @mimetype, @src)
          RETURNING *
      `)
      .get({
        description,
        filename: file.name,
        mimetype: file.mimetype,
        src: file.base64,
      })
    return res.send(newFile)
  })

  router.delete('/api/files', async (req, res) => {
    const { filename, description } = req.body

    db.instance
        .prepare(`
            DELETE FROM files WHERE filename = @filename and description = @description
      `).run({ description, filename })

    return res.send('Ok')
  })

  return router
}

module.exports = buildRoutes
