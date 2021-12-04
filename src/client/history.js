import React from 'react'
import { createBrowserHistory } from 'history'

const history = createBrowserHistory()
export default React.createContext(history)
