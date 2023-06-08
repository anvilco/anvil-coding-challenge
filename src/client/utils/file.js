function getFileInfo (fileName) {
    const ext = fileName.match(/\.\w+$/)?.[0]
    const name = ext ? fileName.split(ext)[0] : fileName

    return {
        ext,
        name,
    }
}

function getFirstMissing (existedVersions) {
    for (let i = 0; i < existedVersions.length; i++) {
        if (existedVersions[i] !== i + 1) {
            return i + 1
        }
    }

    return existedVersions.length + 1
}

const getVersion = ({ name, ext }) => (f) => {
    const escapedFileName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const fileVersionRegEx = new RegExp(`^${escapedFileName}\\((\\d+)\\)${ext}$`)

    return +f.filename.match(fileVersionRegEx)?.[1]
}

function getNewVersion (name, files = []) {
    const fileInfo = getFileInfo(name)

    const existedVersions = files
        .map(getVersion(fileInfo))
        .filter(Boolean)
        .sort((a,b) => a - b)

    let firstMissingVersion = 1
    if (existedVersions) {
        firstMissingVersion = getFirstMissing(existedVersions)
    }

    return `${fileInfo.name}(${firstMissingVersion})${fileInfo.ext}`
}

export function getUniqueFileName (name, files) {
    const hasDuplicate = files.find((f) => f?.filename.includes(name))

    if (hasDuplicate) {
        return getNewVersion(name, files)
    }

    return name
}