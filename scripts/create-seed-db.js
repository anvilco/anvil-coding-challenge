const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')
const seedData = require('./seed.json')
const FileRepository = require('../src/db/repositories/fileRepository')

const SEED_PATH = path.join(__dirname, '..', 'src', 'db', 'seed.db')

function main () {
  if (fs.existsSync(SEED_PATH)) {
    console.log('Deleting seed db')
    fs.unlinkSync(SEED_PATH)
  }

  const db = new Database(SEED_PATH)
  const fileRepository = new FileRepository(db)
  fileRepository.createTable()
  addSeedData(fileRepository)
}

function addSeedData (fileRepository) {
  console.log('Inserting seed data');
  for (const file of seedData.files) {
    fileRepository.insertFile(file.description, file.filename, file.mimetype, file.src, file.username);
  }
}

main()
