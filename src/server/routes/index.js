const os = require('os')
const db = require('db')
const crypto = require('crypto')

// SQLite usage
// https://github.com/WiseLibs/better-sqlite3
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md

function buildRoutes (router) {
  router.get('/api/username', async (req, res) => {
    return res.send({ username: os.userInfo().username })
  })

  router.get('/api/files', async (req, res) => {
    const instance = db.instance

    // Check if the filename_hash column exists in the table schema
    const schema = instance.prepare("PRAGMA table_info('files')").all()
    const columnExists = schema.some((column) => column.name === 'filename_hash')

    // If the column does not exist, add it to the table schema
    if (!columnExists) {
      instance.prepare(`
        ALTER TABLE files ADD COLUMN filename_hash VARCHAR(64)
      `).run()
    }

    // Create an index for the filename_hash column
    instance.prepare(`
      CREATE INDEX IF NOT EXISTS idx_filename_hash ON files (filename_hash)
    `).run()

    // Select all rows from the files table
    const rows = instance.prepare(`
      SELECT id, filename FROM files WHERE filename_hash IS NULL
    `).all()

    // Update the filename_hash column for each row
    for (const row of rows) {
      const { id, filename } = row
      const hash = crypto.createHash('sha256').update(filename).digest('hex')
      
      // Update the filename_hash column with the calculated hash value
      instance.prepare(`
        UPDATE files SET filename_hash = ? WHERE id = ?
      `).run(hash, id)
    }
  
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
          (description, filename, mimetype, src, filename_hash)
          VALUES
          (@description, @filename, @mimetype, @src, @filename_hash)
          RETURNING *
      `)
      .get({
        description,
        filename: file.name,
        mimetype: file.mimetype,
        src: file.base64,
        filename_hash: crypto.createHash('sha256').update(file.name).digest('hex'),
      })
    return res.send(newFile)
  })

  return router
}

module.exports = buildRoutes
