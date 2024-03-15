const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')
const FileRepository = require('db/repositories/fileRepository')

const SEED_DB = path.join(__dirname, 'seed.db')
const DEV_DB = path.join(__dirname, 'dev.db')
const TEST_DB = path.join(__dirname, 'test.db')

function copySeedDB ({ force=false }={}) {
  const localDBPath = process.env.NODE_ENV === 'test'
    ? TEST_DB
    : DEV_DB

  if (force || !fs.existsSync(localDBPath)) {
    fs.writeFileSync(localDBPath, fs.readFileSync(SEED_DB))
  }
  return localDBPath
}
const localDBPath = copySeedDB()

let db = new Database(localDBPath)

module.exports = {
  get instance () {
    return db
  },
  resetToSeed () {
    copySeedDB({ force: true })
    db = new Database(localDBPath)
    const fileRepository = new FileRepository(db)
    fileRepository.createTable()
  },
}
