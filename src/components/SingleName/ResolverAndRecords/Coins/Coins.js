import React from 'react'
import KeyValueRecord from '../KeyValueRecord'
import { validateRecord } from '../../../../utils/records'

const validator = (symbol, value) => {
  return validateRecord({
    type: 'coins',
    selectedKey: symbol,
    value
  })
}

const PLACEHOLDER_RECORDS = ['ETH', 'BTC', 'DOGE', 'ETC']

const getPlaceholder = symbol => {
  return `Enter a ${symbol} address`
}

export default function Coins(props) {
  return (
    <KeyValueRecord
      {...props}
      records={props.updatedRecords.coins}
      placeholderRecords={PLACEHOLDER_RECORDS}
      validator={validator}
      getPlaceholder={getPlaceholder}
      setUpdatedRecords={props.setUpdatedRecords}
      recordType="coins"
    />
  )
}
