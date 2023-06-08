import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Content from 'components/Content'
import FileList from 'components/FileList'
import Button from 'components/Button'
import Toggler from 'components/Toggler'
import IconPlus from 'components/icons/IconPlus'
import SearchInput from 'components/SearchInput'

import NewFileForm from './NewFileForm'

import { getQueryParam, updateQueryParam } from "utils/queryParams"
import { getUniqueFileName } from 'utils/file'
import debounce from 'lodash/debounce'

const StyledContainer = styled.div``

export const Title = styled.h1`
  margin-bottom: 20px;
`

class AllFilesView extends Component {
  constructor (props) {
    super(props)

    this.state = {
      search: '',
      filteredFiles: props.files,
    }

    this.updateSearchState = this.updateSearchState.bind(this)
    this.debouncedHandleNewSearchState = debounce(this.handleNewSearchState, 200)
  }

  componentDidMount () {
    this.updateSearchState()

    this.bindEvents()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.state.search !== prevState.search) {
      this.debouncedHandleNewSearchState()
    }
  }

  componentWillUnmount () {
    this.unbindEvents()
  }

  handleAddFile = (data) => {
    const { addFile, files } = this.props

    data.file.name = getUniqueFileName(data.file.name, files)

    return addFile(data)
  }

  handleSearchChange = (search) => {
    this.setState({
      ...this.state,
      search,
    })
  }

  handleNewSearchState () {
    this.updateSearchQueryParam()
    this.updateFilesList()
  }

  updateSearchQueryParam () {
    const { search } = this.state

    updateQueryParam('search', search)
  }

  updateSearchState () {
      const search = getQueryParam('search')

      this.setState({
        ...this.state,
        search,
      })
    }

  bindEvents () {
    window.addEventListener("popstate", this.updateSearchState)
  }

  unbindEvents () {
    window.removeEventListener("popstate", this.updateSearchState)
  }

  updateFilesList () {
    const { search } = this.state
    const { files } = this.props

    const filteredFiles = files.filter(({ filename, description }) => {
      return !search
          || filename.toLowerCase().includes(search.toLowerCase())
          || description.toLowerCase().includes(search.toLowerCase())
    })

    this.setState({
      ...this.state,
      filteredFiles,
    })
  }

  renderFiles () {
    const { filteredFiles } = this.state
    const { removeFile } = this.props

    return (
      <Content.Card>
        <FileList
          files={filteredFiles}
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

  renderSearchInput () {
    const { search } = this.state

    return (
        <SearchInput
        value={search}
        placeholder="Search by keyword"
        onChange={this.handleSearchChange} />
    )
  }

  render () {
    const { username } = this.props
    return (
      <StyledContainer>
        <Title>{`Hi ${username} 👋`}</Title>
        {this.renderSearchInput()}
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
