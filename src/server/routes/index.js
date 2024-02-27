const os = require('os')
const db = require('db')
const crypto = require('crypto')

// SQLite usage
// https://github.com/WiseLibs/better-sqlite3
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md

function getHash (name) {
  return crypto.createHash('sha256').update(name).digest('hex')
}

// Extract duplicate count from a filename or returns 0 if there isn't any
function extractDuplicateCount (filename) {
  const regex = /\((\d+)\)/ // Matches a number inside parentheses
  const match = regex.exec(filename)

  if (match && match[1]) {
      const cleanedFilename = filename.replace(match[0], '') // Remove matched pattern from filename
      return {
          duplicateCount: parseInt(match[1]),
          cleanedFilename,
      }
  } else {
      return {
          duplicateCount: 0, // Return 0 if no match is found
          cleanedFilename: filename,
      }
  }
}

// Add filename_hash and duplicate_count columns to db
function setupDb () {
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
      ALTER TABLE files ADD COLUMN duplicate_count INTEGER
    `).run()
  }

  // Create an index for the filename_hash column
  instance.prepare(`
    CREATE INDEX IF NOT EXISTS idx_filename_hash ON files (filename_hash)
  `).run()

  // Select all rows from the files table
  const rows = instance.prepare(`
    SELECT id, filename FROM files
  `).all()

  for (const row of rows) {
    const { id, filename } = row
    const result = extractDuplicateCount(filename)
    const duplicateCount = result.duplicateCount
    const cleanedFilename = result.cleanedFilename
    const hash = getHash(cleanedFilename)
    
    // Update the filename_hash column with the calculated hash value
    instance.prepare(`
      UPDATE files SET filename_hash = ?
      WHERE id = ? AND filename_hash IS NULL
    `).run(hash, id)

    // Update the duplicate_count column with the extracted duplicate count
    instance.prepare(`
      UPDATE files SET duplicate_count = ? 
      WHERE id = ? AND duplicate_count IS NULL
    `).run(duplicateCount, id)
  }
}

function buildRoutes (router) {
  router.get('/api/username', async (req, res) => {
    return res.send({ username: os.userInfo().username })
  })

  router.get('/api/files', async (req, res) => {
    setupDb() // Add filename_hash and duplicate_count columns to db on first run
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

    let nextCount = 1
    if (hasDuplicateFilename) {
      const duplicateCounts = db.instance.prepare(`
          SELECT duplicate_count FROM files
          WHERE filename_hash = ?
          ORDER BY duplicate_count ASC
      `).all(hash)
  
      const existingCounts = new Set(duplicateCounts.map((row) => row.duplicate_count))
      while (existingCounts.has(nextCount)) {
          nextCount++
      }
  
      const [namePart, extension] = file.name.split('.').length > 1 ? file.name.split('.') : [file.name, '']
      uniqueFilename = `${namePart}(${nextCount}).${extension}`
    }
    const newFile = db.instance
      .prepare(`
        INSERT INTO files
          (description, filename, mimetype, src, filename_hash, duplicate_count)
          VALUES
          (@description, @filename, @mimetype, @src, @filename_hash, @duplicate_count)
          RETURNING *
      `)
      .get({
        description,
        filename: uniqueFilename,
        mimetype: file.mimetype,
        src: file.base64,
        filename_hash: hash,
        duplicate_count: hasDuplicateFilename ? nextCount : 0,
      })
    return res.send(newFile)
  })

  return router
}

module.exports = buildRoutes
