const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')
const seedData = require('./seed.json')

const SEED_PATH = path.join(__dirname, '..', 'src', 'db', 'seed.db')

function main () {
  if (fs.existsSync(SEED_PATH)) {
    console.log('Deleting seed db')
    fs.unlinkSync(SEED_PATH)
  }

  const db = new Database(SEED_PATH)
  createTables(db)
  addSeedData(db)
}

function createTables (db) {
  console.log('Creating files table')
  db.prepare(`
    CREATE TABLE files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT not null,
      filename TEXT not null,
      mimetype TEXT not null,
      src TEXT not null
    )
  `).run()
}

function addSeedData (db) {
  console.log('Inserting seed data')
  const insertFiles = db.prepare(`
    INSERT INTO files
      (description, filename, mimetype, src)
      VALUES
      (@description, @filename, @mimetype, @src)
  `)

  for (const file of seedData.files) {
    insertFiles.run(file)
  }
}

main()
