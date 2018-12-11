import React from 'react'
import styled from 'react-emotion'

import mq from '../../mediaQuery'

const MainContainer = styled('main')`
  margin-top: 150px;
  ${mq.small`
    margin-left: 200px;
    margin-top: 150px;
  `}
`

const Main = ({ children }) => <MainContainer>{children}</MainContainer>

export default Main
