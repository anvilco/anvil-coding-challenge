import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'

import AllFilesView, { Title } from 'client/routes/AllFiles/AllFilesView'

describe('AllFilesView', function () {
  it('renders the title', function () {
    const wrapper = shallow(
      <AllFilesView
        history={{ push: () => {} }}
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
  // Just want to give an idea of what I would test in a production app

  // it('de-dupes filenames', () => {
  // const addFiles = mockFunction()
  // const wrapper = shallow(
  //   <AllFilesView
  //     history={{ push: () => {} }}
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

  // it('initiates state', () => {
    // const wrapper = shallow(
    //   <AllFilesView
    //     history={{ push: mockFunction() }}
    //     username="Sally"
    //     addFile={() => {}}
    //     files={[{ filename: 'HelloWorld.js' }]}
    //   />,
    // )
    
    // window.location.href = 'http://someOrigin.com?s=test'
    // expect(wrapper.state().currentSearch).toEqual('test');
  // })

    // it('updates state / location', () => {
    // const wrapper = shallow(
    //   <AllFilesView
    //     history={{ push: mockFunction() }}
    //     username="Sally"
    //     addFile={() => {}}
    //     files={[{ filename: 'HelloWorld.js' }]}
    //   />,
    // )
    
    // wrapper.find(Input).props().onChange('newValue')
    // expect(wrapper.state().currentSearch).toEqual('newValue');
    // expect(history.push).toHaveBeenCalledWith(origin + '?s="newValue"')
  // })
})
