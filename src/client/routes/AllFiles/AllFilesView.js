import React, { Component } from 'react'
import has from 'lodash/has'
import keyBy from 'lodash/keyBy'
import set from 'lodash/set'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Content from 'components/Content'
import FileList from 'components/FileList'
import Button from 'components/Button'
import Toggler from 'components/Toggler'
import IconPlus from 'components/icons/IconPlus'

import NewFileForm from './NewFileForm'

const StyledContainer = styled.div``

export const Title = styled.h1`
  margin-bottom: 20px;
`

const getFileExtension = filename => filename.split('.').pop()

class AllFilesView extends Component {
  handleAddFile = (data) => {
    const { addFile, files } = this.prop

    const [baseName, extension] = data.file.name.split('.')
    const filesByFilename = keyBy(files.filter(f => getFileExtension(f.filename) === extension), 'filename')

    let version = 0
    while (has(filesByFilename, data.file.name)) {
      version += 1
      set(data, 'file.name', `${baseName}(${version}).${extension}`)
    }

    return addFile(data)
  }

  renderFiles () {
    const { files } = this.props
    return (
      <Content.Card>
        <FileList
          files={files}
        />
      </Content.Card>
    )
  }

  renderNewFileForm () {
    return (
      <Toggler
        renderButton={({ showItem, onClick }) => (
          <Button type="link" onClick={onClick}>
            <IconPlus />
            <span>{showItem ? 'Close Add Form' : 'Add a File'}</span>
          </Button>
        )}
      >
        {() => (
          <NewFileForm data-testid="new-file-form" onSubmit={this.handleAddFile} />
        )}
      </Toggler>
    )
  }

  render () {
    const { username } = this.props
    return (
      <StyledContainer>
        <Title>{`Hi ${username} 👋`}</Title>
        {this.renderFiles()}
        {this.renderNewFileForm()}
      </StyledContainer>
    )
  }
}

AllFilesView.propTypes = {
  addFile: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  })).isRequired,
}

export default AllFilesView
