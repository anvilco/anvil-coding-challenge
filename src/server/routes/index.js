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
  const regex = /\((\d+)\)\./ // Matches a number inside parentheses followed by a period
  const match = regex.exec(filename)

  if (match && match[1]) {
      const cleanedFilename = filename.replace(match[0], '.') // Remove number inside parentheses from filename 
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
    const { uniqueFilename, hash, nextCount } = processFile(file)
    
    const newFile = db.instance.prepare(`
        INSERT INTO files
            (description, filename, mimetype, src, filename_hash, duplicate_count)
        VALUES
            (@description, @filename, @mimetype, @src, @filename_hash, @duplicate_count)
        RETURNING *
    `).get({
        description,
        filename: uniqueFilename,
        mimetype: file.mimetype,
        src: file.base64,
        filename_hash: hash,
        duplicate_count: nextCount,
    })

    return res.send(newFile)
})

function processFile (file) {
    let uniqueFilename = file.name
    const { duplicateCount, cleanedFilename } = extractDuplicateCount(file.name)
    let hash = getHash(cleanedFilename)
    let count = db.instance.prepare("SELECT COUNT(*) as count FROM files WHERE filename_hash = ?").pluck().get(hash)
    let hasDuplicateFilename = count > 0

    let duplicateCounts = getDuplicateCounts(hash)

    const [namePart, extension] = file.name.split('.').length > 1 ? file.name.split('.') : [file.name, '']
    let nextCount = duplicateCount !== 0 ? 1 : 0 // Initialize nextCount to 1 if filename already has a duplicate count, else 0
    let existingCounts = new Set(duplicateCounts.map((row) => row.duplicate_count))

    // Find duplicates of the original filename instead of the cleaned filename if adding it would create a duplicate
    if (hasDuplicateFilename && existingCounts.has(duplicateCount)) {
        hash = getHash(file.name)
        count = db.instance.prepare("SELECT COUNT(*) as count FROM files WHERE filename_hash = ?").pluck().get(hash)
        hasDuplicateFilename = count > 0
        duplicateCounts = getDuplicateCounts(hash)
        existingCounts = new Set(duplicateCounts.map((row) => row.duplicate_count))
        while (existingCounts.has(nextCount)) {
            nextCount++
        }
        uniqueFilename = `${namePart}(${nextCount}).${extension}`

        return { uniqueFilename, hash, nextCount }
    }

    if (hasDuplicateFilename) {
      while (existingCounts.has(nextCount)) {
          nextCount++
      }
      if (nextCount > 0) {
          uniqueFilename = `${namePart}(${nextCount}).${extension}`
      }

      return { uniqueFilename, hash, nextCount }
    }

    return { uniqueFilename, hash, nextCount }
}

// Retrieve all duplicate counts for the given hash from the database
function getDuplicateCounts (hash) {
  return db.instance.prepare(`
      SELECT duplicate_count FROM files
      WHERE filename_hash = ?
      ORDER BY duplicate_count ASC
  `).all(hash)
}

  return router
}

module.exports = buildRoutes
