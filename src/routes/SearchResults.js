import React from 'react'
import DomainInfo from '../components/SearchName/DomainInfo'
import SubDomainResults from '../components/SubDomainResults/SubDomainResults'
import SideNav from '../components/SideNav/SideNav'
import Container from '../components/Container'
import Main from '../components/Layout/Main'

export default props => (
  <Container>
    <SideNav />
    <Main>
      <DomainInfo />
      <SubDomainResults />
    </Main>
  </Container>
)
