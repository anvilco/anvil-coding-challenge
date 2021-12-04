import _ from 'lodash'
import React from 'react'
import AllFilesView from './AllFilesView'
import useFetch from 'hooks/useFetch'
import FetchFeedback from 'components/FetchFeedback'
import HistoryContext from 'history'

function createUpdateRequest ({ url, method, onSuccess }) {
  return async (data) => {
    const result = await fetch(url, {
      method: method || 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (onSuccess) onSuccess(result)
  }
}

const AllFiles = () => {
  const username = useFetch('/api/username')
  const files = useFetch('/api/files')

  const addFile = createUpdateRequest({
    url: '/api/files',
    onSuccess: () => files.refetch(),
  })

  return (
    <FetchFeedback
      responses={[username, files]}
    >
      {() => (
        <HistoryContext.Consumer>
          {history => (
            <AllFilesView
              history={history}
              addFile={addFile}
              files={files.data}
              username={_.get(username, 'data.username')}
            />
          )}
        </HistoryContext.Consumer>
      )}
    </FetchFeedback>
  )
}

export default AllFiles
