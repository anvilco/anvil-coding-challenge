const db = require('db')
const FileRepository = require('db/repositories/fileRepository')
const FileUploadHelper = require('utils/fileUploader')

// SQLite usage
// https://github.com/WiseLibs/better-sqlite3
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md

function buildRoutes (router) {
  const fileRepository = new FileRepository(db.instance)

  router.get('/api/username', async (req, res) => {
    return res.send({ username: req.username })
  })

  router.get('/api/files', async (req, res) => {
    const { page = 0, size = 30 } = req.query
    const files = fileRepository.getUserFiles({ username: req.username, page: parseInt(page), size: parseInt(size) })
    return res.send(files)
  })

  router.post('/api/files', async (req, res) => {
    const username = req.username
    const { description, file } = req.body

    const dbOriginalFile = fileRepository.getOriginalFile({ 
      username,
      filename: file.name,
      base64: file.base64,
    })

    let filename = file.name

    if (dbOriginalFile) {
      const fileUploader = new FileUploadHelper(file)
      const existingFiles = fileRepository.findAllLike({
        username, 
        filename: fileUploader.fileBaseName, 
        base64: file.base64, 
        fileExt: fileUploader.fileExt,
      })

      if (!existingFiles.length) {
        filename = fileUploader.generateDuplicateFilename(dbOriginalFile.filename)
      } else {
        // If there are multiple duplicate db files, finding the next duplicate number (fill the gaps)
        // TODO: fix for 10+ duplicate files 
        let i = 0
          while (i < existingFiles.length - 1) {
            // if current file name identifier does not match the current iteration, breakout out of loop. Missing a duplicate, gap should be filled
            if (existingFiles[i].filename !== `${fileUploader.fileBaseName}(${i+1}).${fileUploader.fileExt}`) {
              break
            }
            i += 1
          }
          filename = fileUploader.generateDuplicateFilename(existingFiles[i].filename, i+1)
      }
    }

    const newFile = fileRepository.insertFile({
      description,
      filename,
      mimetype: file.mimetype,
      src: file.base64,
      username,
    })
    return res.send(newFile)
  })

  return router
}

module.exports = buildRoutes
