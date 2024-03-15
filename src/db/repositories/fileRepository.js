/**
 * Represents a repository for managing files in the database
 */
class FileRepository {
  constructor (database) {
    this.db = database
    this.createTable()
  }

  /**
   * Creates the "files" table in the database if it does not exist
   */
  createTable () {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        filename TEXT NOT NULL,
        mimetype TEXT NOT NULL,
        src TEXT NOT NULL,
        username TEXT NOT NULL
      );
    `).run()
    
    this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_filename ON files (filename);
    `).run()

    this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_filename ON files (filename);
    `).run()

    this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_username ON files (username);
    `).run()

    this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_src ON files (src);
    `).run()
  }

  /**
   * Inserts a single file record into the database
   * @param {Object} file - An object containing description, filename, mimetype, src, and username
   * @returns {Object} The inserted file record
   */
  insertFile ({ description, filename, mimetype, src, username }) {
    const result = this.db
      .prepare(`
        INSERT INTO files (description, filename, mimetype, src, username)
        VALUES (@description, @filename, @mimetype, @src, @username)
        RETURNING *
      `)
      .run({ description, filename, mimetype, src, username })
    const dbFile = this.getFileById(result.lastInsertRowid)
    // console.log(`[INFO] FileRepository.insertFile(): "${filename}"`, dbFile)
    return dbFile
  }

  /**
   * Inserts multiple file records into the database in a single transaction.
   * @param {Array} data - An array of objects (filename, descriptionm mimetype, src, and username) to be inserted into the database.
   */
  bulkInsertFiles (data) {
    const insert = this.db.prepare(`
      INSERT INTO files
      (description, filename, mimetype, src, username)
      VALUES
      (@description, @filename, @mimetype, @src, @username)
    `)

    const insertMany = this.db.transaction((cats) => {
      for (const cat of cats) {
        insert.run({
          description: cat.description,
          filename: cat.filename,
          mimetype: cat.mimetype,
          src: cat.src,
          username: cat.username,
        })
      }
    })
    insertMany(data)
  }

  /**
   * Retrieves a file record from the database by its ID.
   * @param {number} id - The ID of the file record.
   * @returns {Object} The file record matching the provided ID.
   */
  getFileById (id) {
    return this.db.prepare(`
      SELECT * FROM files
      WHERE id = :id
    `).get({ id })
  }

  /**
   * Retrieves the count of files associated with a specific user.
   * @param {string} username - The username of the user.
   * @returns {number} The count of files uploaded by the user.
   */
  getUserFilesCount (username) {
    return this.db.prepare(`
      SELECT COUNT(*) AS count FROM files
      WHERE username = :username
    `).get({ username }).count
  }

  /**
   * Retrieves paginated files associated with a specific user.
   * @param {string} username - The username of the user.
   * @param {number} size - The maximum number of files to retrieve.
   * @param {number} page - The number of files to skip before starting to return records.
   * @returns {object} An object of file records uploaded by the user and total.
   */
  getUserFiles ({ username, page, size }) {
    page = page || 1
    size = size || 30
    const offset = (page -1) * size
    return this.db.prepare(`
      SELECT * FROM files
      WHERE username = :username
      LIMIT :limit OFFSET :offset
    `).all({ username, limit: size, offset })
  }

  /**
   * Retrieves the count of all files.
   * @returns {number} The count of all files.
   */
  getTotal () {
    return this.db.prepare(`
      SELECT COUNT(*) AS count FROM files
    `).get().count
  }

  /**
   * Retrieves all files stored in the database.
   * @param {number} size - The maximum number of files to retrieve.
   * @param {number} page - The number of files to skip before starting to return records.s
   * @returns {Array} An array of all file records.
   */
  getAllFiles ({ page=1, size=30 }) {
    page = page || 1
    size = size || 30
    const offset = (page - 1) * size
    return this.db.prepare(`SELECT * FROM files LIMIT :limit OFFSET :offset`).all({ limit: size, offset })
  }

  /**
   * Deletes a file record from the database by its ID.
   * @param {number} id - The ID of the file record to be deleted.
   * @returns {boolean} A boolean, return true if deletion was successful.
   */
  deleteFileById (id) {
    const deleteStmt = this.db.prepare(`
      DELETE FROM files
      WHERE id = :id
    `)
    return deleteStmt.run({ id }).changes > 0
  }

  /**
   * Retrieves the original file record matching the provided criteria.
   * @param {Object} criteria - An object match the containing (username, filename, and base64) for finding the original file.
   * @returns {Object|null} The original file record matching the provided criteria or null if not found.
   */
  getOriginalFile ({ username, filename, base64 }) {
    return this.db.prepare(`
      SELECT id, filename, src
      FROM files 
      WHERE 
        filename == :filename
        AND src == :src
        AND username == :username
    `)
    .get({
      filename,
      username,
      src: base64,
    })
  }
  
  /**
   * Retrieves all files similar to the provided criteria. Used to get the list of duplicate document
   * @param {Object} criteria - An object containing the criteria (username, filename, fileExt, and base64) for finding similar files.
   * @returns {Array} An object with records similar to the provided criteria and total matching in DB.
   */
  findAllLike ({ username, filename, fileExt, base64, size=30, page=1 }) {
    page = page || 1
    size = size || 30
    const offset = (page - 1) * size
    return this.db.prepare(`
      SELECT id, filename, src
      FROM files 
      WHERE 
        filename == :filename OR filename LIKE :similarFilename
        AND src == :src
        AND username == :username
      ORDER BY filename ASC
      LIMIT :limit OFFSET :offset
    `)
    .all({
      filename: `${filename}.${fileExt}`,
      similarFilename: `${filename}(%.${fileExt}`,
      src: base64,
      username,
      offset,
      limit: size,
    })
  }
}

module.exports = FileRepository