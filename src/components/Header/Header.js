import React, { useState } from 'react'
import styled from 'react-emotion'

import mq, { useMediaMin } from 'mediaQuery'

import DefaultLogo from '../Logo'
import Search from '../SearchName/Search'
import Hamburger from './Hamburger'
import SideNav from '../SideNav/SideNav'

const Header = styled('header')`
  ${p =>
    p.isMenuOpen
      ? `
    background: #121D46;
  `
      : ''}
  display: flex;
  flex-direction: row;
  justify-content: center;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 100000;
  box-shadow: 0 4px 8px 0 rgba(230, 240, 247, 0.8);
  height: 50px;
  ${mq.medium`
    box-shadow: 0 8px 24px 0 rgba(230, 240, 247, 0.8);
    height: auto;
  `}
`

const SearchHeader = styled(Search)`
  margin-top: 50px;
  width: 100%;
  ${mq.medium`
    margin-top: 0;
    width: calc(100% - 200px);
  `}
`

const Logo = styled(DefaultLogo)`
  background: white;
  position: relative;
  display: flex;
  width: 100%;
  ${p =>
    p.isMenuOpen
      ? `
    opacity: 0;
  `
      : ``}

  ${mq.medium`
    opacity: 1;
    &:before {
      background: #d3d3d3;
      height: 32px;
      margin-top: 30px;
      content: '';
      width: 1px;
      right: 35px;
      top: 0;
      position: absolute;
    }
  `}
`

function HeaderContainer() {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const mediumBp = useMediaMin('medium')
  const toggleMenu = () => setMenuOpen(!isMenuOpen)

  return (
    <>
      <Header isMenuOpen={isMenuOpen}>
        <Logo isMenuOpen={isMenuOpen} />
        {mediumBp ? (
          <SearchHeader />
        ) : (
          <Hamburger isMenuOpen={isMenuOpen} openMenu={toggleMenu} />
        )}
      </Header>
      <SideNav isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      {!mediumBp && (
        <>
          <SearchHeader />
        </>
      )}
    </>
  )
}

export default HeaderContainer
