import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'

import AllFilesView, { Title } from 'client/routes/AllFiles/AllFilesView'

describe('AllFilesView', function () {
  it('renders the title', function () {
    const wrapper = shallow(
      <AllFilesView
        username="Sally"
        addFile={() => {}}
        files={[]}
      />,
    )

    const title = wrapper.find(Title)
    expect(title).to.have.length(1)
    expect(title.text()).to.equal('Hi Sally 👋')
  })

  // Pseudo-code since I'm not familiar with Chai

  // it('de-dupes filenames', () => {
  // const addFiles = mockFunction()
  // const wrapper = shallow(
  //   <AllFilesView
  //     username="Sally"
  //     addFile={addFiles}
  //     files={[{ filename: 'HelloWorld.js' }]}
  //   />,
  // )
  // 
  // wrapper.find('[data-testid="new-file-form"]').props().onSubmit({ data: { file: { name: 'HellowWorld.js' }}})
  // expect(addFile).toHaveBeenCalledWith({ file: { name: 'HelloWorld(1).js '}})
  // })

  // ... add other scenarios de-dupe here, e.g. (1) and (3) exist but not (2)
})
