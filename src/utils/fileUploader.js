/**
 * A utility class for handling file uploads.
 */
class FileUploadHelper {
  /**
   * Initializes the FileUploadHelper with file data.
   * @param {Object} file - The file data object.
   */
  constructor (file) {
    /**
     * The file data object.
     * @type {Object}
     */
    this.fileData = file
    /**
     * The original filename of the file.
     * @type {string}
     */
    this.originalFilename = file.name

    this.fileExt = null
    this.fileBaseName = null
    this.setFilenameParts()
  }

  /**
   * Parses the filename string to return the base filename and the file extension.
   * @param {string} filename - The filename to parse.
   * @returns {Object} An object containing the base filename and file extension.
   */
  extractFilenameParts (filename) {
    const fileNameParts = filename.split('.') 
      let baseFileName
      
      const fileExt = fileNameParts[fileNameParts.length - 1]
      if (fileNameParts.length > 2) {
        baseFileName = fileNameParts.slice(0, -1).join('.')
      } else {
        baseFileName = fileNameParts[0]
      }
      return {
        baseFileName,
        fileExt,
      }
  }

  /**
   * Sets values for the class's base filename and the file extension
   */
  setFilenameParts () {
    const { fileExt, baseFileName } = this.extractFilenameParts(this.fileData.name)
    this.fileExt = fileExt
    this.fileBaseName = baseFileName
  }

  /**
   * Checks if the provided database file has the same name and source data as the current file.
   * @param {Object} dbFile - The file data from the database.
   * @returns {boolean} Returns true if the files are duplicate, otherwise false.
   */
  isDuplicate (dbFile) {
    return this.fileData.name === dbFile.filename && this.fileData.base64 === dbFile.src
  }

  /**
   * Generates a new filename for a duplicate file.
   * If the filename already exists in the database, it appends a duplicate number to the filename.
   * If the filename already contains a duplicate number, it replaces it with the new duplicate number.
   * @param {string} dbFilename - The filename from the database.
   * @param {number} dupNum - The duplicate number to append to the filename.
   * @returns {string} The new filename.
   */
  generateDuplicateFilename (dbFilename, dupNum) {
    // If duplicate number is not provided, default to 1
    dupNum = dupNum || 1

    const { baseFileName: dbBaseName, fileExt: dbFileExt } = this.extractFilenameParts(dbFilename)
    // if the file to be uploaded has the same file name as entity in database, adding duplicate name syntax
    if (dbFilename === this.originalFilename) {
      return `${dbBaseName}(${dupNum}).${dbFileExt}`
    }

    // For uploading files with names like 'test(1).jpg' or 'test(1)(1).jpg', handle duplicate name syntax
    const filenamePattern = /^(?<name>[\w\-_\d]+(\(\d+\))*?)(?=(?<end>((\(\d+\))?\.[a-z]+$)))/
    let newFilename = dbFilename

    const matchResult = newFilename.match(filenamePattern)
    if (matchResult) {
      /**
       * Extract base filename and extension from the matched groups
       * Files like:
       *  - test.png will have a groups.name "test" and groups.end ".png"
       *  - test(1).png have a group.name "test" and groups.end "(1).png", 
       */
      newFilename = matchResult.groups.name
      const extension = matchResult.groups.end

      // Extract the duplicate number from the ending using regex pattern
      const dupNumPattern = /\d+/
      const dupNumMatch = extension.match(dupNumPattern)
      
      // If the duplicate number is found in the ending, replace it with the new duplicate number
      if (dupNumMatch) {
        extension.replace(dupNumMatch[0], dupNum.toString())
        newFilename += extension.replace(dupNumMatch[0], dupNum.toString())
      } else {
        // If no duplicate number found, append the new duplicate number to the filename
        newFilename += `(${dupNum.toString()})${extension}`
      }
    }
    return newFilename
  }
}

module.exports = FileUploadHelper