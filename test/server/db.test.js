const { expect } = require('chai')
const db = require('db')

describe('db', function () {
  let res, filename
  beforeEach(async function () {
    filename = 'file-name.txt'
    await db.resetToSeed()
  })

  it('writes a file', async function () {
    res = db.instance
      .prepare(`
        INSERT INTO files
          (description, filename, mimetype, src, username)
          VALUES
          (@description, @filename, @mimetype, @src, @username)
      `)
      .run({
        description: 'My file',
        filename,
        mimetype: 'text/plain',
        src: 'abc',
        username: 'test',
      })
    expect(res).to.be.ok
  })

  it('resets the db between tests', async function () {
    res = db.instance.
      prepare(`
        SELECT * from files where filename = @filename
      `)
      .all({ filename })
    expect(res).to.eql([])
  })
})
