import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Content from 'components/Content'
import FileList from 'components/FileList'
import Button from 'components/Button'
import Toggler from 'components/Toggler'
import IconPlus from 'components/icons/IconPlus'

import NewFileForm from './NewFileForm'

import { getUniqueFileName } from 'utils/file'

const StyledContainer = styled.div``

export const Title = styled.h1`
  margin-bottom: 20px;
`

class AllFilesView extends Component {
  handleAddFile = (data) => {
    const { addFile, files } = this.props

    data.file.name = getUniqueFileName(data.file.name, files)

    return addFile(data)
  }

  renderFiles () {
    const { files, removeFile } = this.props
    return (
      <Content.Card>
        <FileList
          files={files}
          onRemoveFile={removeFile}
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
          <NewFileForm onSubmit={this.handleAddFile} />
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
  removeFile: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  })).isRequired,
}

export default AllFilesView
