import React from 'react'
import styled from 'react-emotion'

const YearsContainer = styled('div')`
  display: flex;
  flex-direction: column;
  max-width: 220px;
`

const Stepper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dfdfdf;
`

const Icon = styled('div')`
  font-family: Overpass;
  font-size: 28px;
  font-weight: 100;
  color: #adbbcd;
  border-radius: 50%;
  border: solid #adbbcd 1px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    cursor: pointer;
  }
`

const Amount = styled('div')`
  width: 150px;
  padding-left: 20px;
  display: flex;
  font-family: Overpass;
  font-size: 28px;
  font-weight: 100;
  color: #2b2b2b;

  input {
    font-family: Overpass;
    font-size: 28px;
    font-weight: 100;
    color: #2b2b2b;
    border: none;
    max-width: 45px;
    outline: 0;
  }
`

const Description = styled('div')`
  font-family: Overpass;
  font-weight: 300;
  font-size: 14px;
  color: #adbbcd;
  margin-top: 10px;
`

const Years = ({ years, setYears }) => {
  const incrementYears = () => setYears(years + 1)
  const decrementYears = () => (years > 1 ? setYears(years - 1) : null)
  return (
    <YearsContainer>
      <Stepper>
        <Icon onClick={decrementYears}>-</Icon>
        <Amount>
          <input
            type="number"
            value={years}
            onChange={e => {
              setYears(e.target.value)
            }}
          />{' '}
          year{years > 1 && 's'}
        </Amount>
        <Icon onClick={incrementYears}>+</Icon>
      </Stepper>
      <Description>Rental Period</Description>
    </YearsContainer>
  )
}

export default Years
