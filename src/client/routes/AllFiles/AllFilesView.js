import React, { Component } from 'react'
import has from 'lodash/has'
import keyBy from 'lodash/keyBy'
import set from 'lodash/set'
import PropTypes from 'prop-types'
import { parse } from 'querystring'
import styled from 'styled-components'

import Content from 'components/Content'
import FileList from 'components/FileList'
import Button from 'components/Button'
import Toggler from 'components/Toggler'
import IconPlus from 'components/icons/IconPlus'
import Input from 'components/Input'

import NewFileForm from './NewFileForm'

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`

export const Title = styled.h1`
  margin-bottom: 20px;
`

const getFileExtension = filename => filename.split('.').pop()

class AllFilesView extends Component {
  state = {
    // Get current term on render
    currentSearch: parse(window.location.href.split('?')[1]).s,
  }

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
          filterBy={this.state.currentSearch}
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

  renderSearchBar () {
    const { history } = this.props

    const onChange = value => {
      this.setState({ currentSearch: value }, () => {
        history.push(
          value ? `${window.location.origin}?s=${value}` : window.location.origin,
        )
      })
    }

    return (
      <Input
        onChange={onChange}
        value={this.state.currentSearch}
        name="search-bar"
        placeholder="Searcy by keyword"
      />
    )
  }

  render () {
    const { username } = this.props
    return (
      <StyledContainer>
        <Title>{`Hi ${username} 👋`}</Title>
        {this.renderSearchBar()}
        {this.renderFiles()}
        {this.renderNewFileForm()}
      </StyledContainer>
    )
  }
}

AllFilesView.propTypes = {
  history: PropTypes.object.isRequired,
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
