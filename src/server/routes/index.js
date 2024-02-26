const os = require('os')
const db = require('db')
const crypto = require('crypto')

// SQLite usage
// https://github.com/WiseLibs/better-sqlite3
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md

function getHash(name) {
  return crypto.createHash('sha256').update(name).digest('hex')
}

function buildRoutes (router) {
  router.get('/api/username', async (req, res) => {
    return res.send({ username: os.userInfo().username })
  })

  router.get('/api/files', async (req, res) => {
    const instance = db.instance

    // Check if the filename_hash column exists in the table schema
    const schema = instance.prepare("PRAGMA table_info('files')").all()
    const filenameHashColumnExists = schema.some((column) => column.name === 'filename_hash')
    const duplicateCountColumnExists = schema.some((column) => column.name === 'duplicate_count')

    // If the filename_hash column does not exist, add it to the table schema
    if (!filenameHashColumnExists) {
      instance.prepare(`
        ALTER TABLE files ADD COLUMN filename_hash VARCHAR(64)
      `).run()
    }

    // If the duplicate_count column does not exist, add it to the table schema
    if (!duplicateCountColumnExists) {
      instance.prepare(`
        ALTER TABLE files ADD COLUMN duplicate_count INTEGER DEFAULT 0
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
      const hash = getHash(filename)
      
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
    const hash = getHash(file.name)
    const count = db.instance.prepare("SELECT COUNT(*) as count FROM files WHERE filename_hash = ?").pluck().get(hash)
    const hasDuplicateFilename = count > 0
    let uniqueFilename = file.name

    if (hasDuplicateFilename) {
      const duplicateCounts = db.instance.prepare(`
          SELECT duplicate_count FROM files
          WHERE filename_hash = ?
          ORDER BY duplicate_count ASC
      `).all(hash)
  
      const existingCounts = new Set(duplicateCounts.map((row) => row.duplicate_count))
      let nextCount = 0
  
      while (existingCounts.has(nextCount)) {
          nextCount++
      }
  
      const [namePart, extension] = file.name.split('.').length > 1 ? file.name.split('.') : [file.name, '']
      uniqueFilename = `${namePart}(${nextCount}).${extension}`
  }
  
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
        filename: uniqueFilename,
        mimetype: file.mimetype,
        src: file.base64,
        filename_hash: getHash(file.name),
      })
    return res.send(newFile)
  })

  return router
}

module.exports = buildRoutes
