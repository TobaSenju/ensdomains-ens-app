import React from 'react'
import styled from 'react-emotion'
import Loader from './Loader'

const PendingContainer = styled('div')`
  display: flex;
`

const Text = styled('span')`
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  margin-right: 10px;
`
const Pending = ({ className, children = 'Tx pending' }) => (
  <PendingContainer className={className}>
    <Text>{children}</Text>
    <Loader />
  </PendingContainer>
)

export default Pending
