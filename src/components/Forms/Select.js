import React, { Component } from 'react'
import styled from 'react-emotion'
import Select from 'react-select'

const SelectContainer = styled('div')`
  width: 250px;
`

const styles = {
  control: styles => ({
    ...styles,
    backgroundColor: 'white',
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: '12px',
    color: '#2B2B2B',
    letterSpacing: '0.5px'
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    console.log(data)
    return {
      ...styles,
      // backgroundColor: isDisabled
      //   ? null
      //   : isSelected
      //     ? data.color
      //     : isFocused
      //       ? color.alpha(0.1).css()
      //       : null,
      backgroundColor: 'white',
      textTransform: 'uppercase',
      fontWeight: '700',
      fontSize: '12px',
      color: '#2B2B2B',
      letterSpacing: '0.5px',
      color: isDisabled ? '#ccc' : isSelected ? 'black' : '#ccc',
      cursor: isDisabled ? 'not-allowed' : 'default'
    }
  },
  input: styles => ({ ...styles }),
  placeholder: styles => ({ ...styles }),
  singleValue: (styles, { data }) => ({ ...styles })
}

class SelectComponent extends Component {
  render() {
    const { selectedOption, handleChange, className } = this.props

    return (
      <SelectContainer className={className}>
        <Select
          value={selectedOption}
          onChange={handleChange}
          {...this.props}
          styles={styles}
          theme={theme => ({
            ...theme,
            borderRadius: 10,
            colors: {
              ...theme.colors,
              text: 'orangered',
              primary25: 'blue',
              primary: '#cccccc'
            }
          })}
        />
      </SelectContainer>
    )
  }
}

export default SelectComponent
