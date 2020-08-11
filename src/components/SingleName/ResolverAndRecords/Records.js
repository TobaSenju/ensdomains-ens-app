import React, { useState, useReducer, useEffect } from 'react'
import { useMutation } from 'react-apollo'
import styled from '@emotion/styled/macro'
import isEqual from 'lodash/isEqual'
import differenceWith from 'lodash/differenceWith'
import { useQuery } from 'react-apollo'
import { useTranslation } from 'react-i18next'
import { getNamehash } from '@ensdomains/ui'

import { useEditable } from '../../hooks'
import { ADD_MULTI_RECORDS } from '../../../graphql/mutations'
import COIN_LIST from 'constants/coinList'
import TEXT_RECORD_KEYS from 'constants/textRecords'
import PendingTx from '../../PendingTx'

import {
  SET_RESOLVER,
  SET_ADDRESS,
  SET_CONTENT,
  SET_CONTENTHASH,
  SET_TEXT,
  SET_ADDR
} from 'graphql/mutations'

import {
  GET_TEXT,
  GET_ADDR,
  GET_ADDRESSES,
  GET_TEXT_RECORDS,
  GET_RESOLVER_MIGRATION_INFO,
  GET_RESOLVER_FROM_SUBGRAPH
} from 'graphql/queries'

import AddRecord from './AddRecord'
import ContentHash from './ContentHash'
import TextRecord from './TextRecord'
import Coins from './Coins'
import DefaultSaveCancel from '../SaveCancel'

const RecordsWrapper = styled('div')`
  border-radius: 6px;
  border: 1px solid #ededed;
  box-shadow: inset 0 0 10px 0 rgba(235, 235, 235, 0.5);
  display: ${p => (p.shouldShowRecords ? 'block' : 'none')};
  margin-bottom: 20px;
`

const CantEdit = styled('div')`
  padding: 20px;
  font-size: 14px;
  color: #adbbcd;
  background: hsla(37, 91%, 55%, 0.1);
`

const EditModeButton = styled('div')`
  color: ${p => (p.canEdit ? '#5284FF' : '#ccc')};
`

const SaveCancel = styled(DefaultSaveCancel)``

const ConfirmBox = styled('div')`
  p {
    font-weight: 300;
    font-size: 14px;
  }
  padding: 20px;
  background: #f0f6fa;
  display: flex;

  ${p =>
    p.pending
      ? 'justify-content: flex-end;'
      : 'justify-content: space-between;'}
`

const RECORDS = [
  {
    label: 'Addresses',
    value: 'coins'
  },
  {
    label: 'Content',
    value: 'content'
  },
  {
    label: 'Text',
    value: 'textRecords'
  }
]

function isEmpty(record) {
  if (parseInt(record, 16) === 0) {
    return true
  }
  if (record === '0x') {
    return true
  }
  if (!record) {
    return true
  }
  return false
}

function hasAnyRecord(domain) {
  if (!isEmpty(domain.addr)) {
    return true
  }

  if (!isEmpty(domain.content)) {
    return true
  }
}

function calculateShouldShowRecords(isOwner, hasResolver, hasRecords) {
  //do no show records if it only has a resolver if not owner
  if (!isOwner && hasRecords) {
    return true
  }
  //show records if it only has a resolver if owner so they can add
  if (isOwner && hasResolver) {
    return true
  }
  return false
}

function reducer(state, action) {
  switch (action.type) {
    case 'EDIT_RECORD':
      return {
        ...state,
        [action.record.name]: action.record
      }
    case 'ADD_RECORD':
      return {
        ...state,
        [action.record.name]: action.record
      }
  }
}

function getChangedRecords(initialRecords, updatedRecords) {
  if (initialRecords.loading)
    return {
      textRecords: [],
      coins: []
    }

  const textRecords = differenceWith(
    updatedRecords.textRecords,
    initialRecords.textRecords,
    isEqual
  )
  const coins = differenceWith(
    updatedRecords.coins,
    initialRecords.coins,
    isEqual
  )

  const contentHash = !isEqual(
    updatedRecords.contentHash,
    initialRecords.contentHash
  )
    ? updatedRecords.contentHash
    : undefined

  return {
    textRecords,
    coins,
    ...(contentHash && { contentHash })
  }
}

function checkRecordsHaveChanged(changedRecords) {
  return (
    changedRecords.textRecords.length > 0 ||
    changedRecords.coins.length > 0 ||
    changedRecords.contenthash
  )
}

function checkRecordsAreValid(changedRecords) {
  const textRecordsValid = !(
    changedRecords.textRecords.filter(record => record.isValid === false)
      .length > 0
  )

  const coinsValid = !(
    changedRecords.coins.filter(record => record.isValid === false).length > 0
  )

  return textRecordsValid && coinsValid
}

// graphql data in resolver and records to check current records
// state in resolver and records to record new edit changes
// check old and new to see if any have changed
// abstract build tx data into function and use it here
//

export default function Records({
  domain,
  isOwner,
  refetch,
  account,
  hasResolver,
  isOldPublicResolver,
  isDeprecatedResolver,
  hasMigratedRecords,
  needsToBeMigrated
}) {
  const { t } = useTranslation()
  const [updatedRecords, setUpdatedRecords] = useState({
    contentHash: undefined,
    coins: [],
    textRecords: []
  })
  const { actions, state } = useEditable()
  const [editing, setEditing] = useState(false)
  const startEditing = () => setEditing(true)
  const stopEditing = () => setEditing(false)

  const { pending, confirmed, txHash } = state
  const { startPending, setConfirmed } = actions

  const [addMultiRecords] = useMutation(ADD_MULTI_RECORDS, {
    onCompleted: data => {
      startPending(Object.values(data)[0])
    }
  })

  //const [editMode, setEditMode] = useState(false)

  const {
    loading: addressesLoading,
    data: dataAddresses,
    refetch: refetchAddresses
  } = useQuery(GET_ADDRESSES, {
    variables: { name: domain.name, keys: COIN_LIST }
  })

  const { data: dataTextRecordKeys, loading, error } = useQuery(
    GET_RESOLVER_FROM_SUBGRAPH,
    {
      variables: {
        id: getNamehash(domain.name)
      }
    }
  )

  //TEXT_RECORD_KEYS use for fallback

  const {
    loading: textRecordsLoading,
    data: dataTextRecords,
    refetch: refetchTextRecords
  } = useQuery(GET_TEXT_RECORDS, {
    variables: {
      name: domain.name,
      keys:
        dataTextRecordKeys &&
        dataTextRecordKeys.domain &&
        dataTextRecordKeys.domain.resolver &&
        dataTextRecordKeys.domain.resolver.texts
    },
    skip: !dataTextRecordKeys
  })

  const initialRecords = {
    textRecords: dataTextRecords && dataTextRecords.getTextRecords,
    coins: dataAddresses && dataAddresses.getAddresses,
    contentHash: domain.content,
    loading: textRecordsLoading || addressesLoading
  }

  useEffect(() => {
    if (textRecordsLoading === false && addressesLoading === false) {
      setUpdatedRecords(initialRecords)
    }
  }, [textRecordsLoading, addressesLoading, dataAddresses, dataTextRecords])

  const emptyRecords = RECORDS.filter(record => {
    if (record.value === 'address') {
      return isEmpty(domain['addr']) ? true : false
    }

    return isEmpty(domain[record.value]) ? true : false
  })

  let contentMutation
  if (domain.contentType === 'oldcontent') {
    contentMutation = SET_CONTENT
  } else {
    contentMutation = SET_CONTENTHASH
  }

  const hasRecords = hasAnyRecord(domain)

  const changedRecords = getChangedRecords(initialRecords, updatedRecords)

  const shouldShowRecords = calculateShouldShowRecords(
    isOwner,
    hasResolver,
    hasRecords
  )
  const canEditRecords =
    !isOldPublicResolver && !isDeprecatedResolver && isOwner

  if (!shouldShowRecords) {
    return null
  }

  const haveRecordsChanged = checkRecordsHaveChanged(changedRecords)
  const areRecordsValid = checkRecordsAreValid(changedRecords)

  return (
    <RecordsWrapper
      shouldShowRecords={shouldShowRecords}
      needsToBeMigrated={needsToBeMigrated}
    >
      {!canEditRecords && isOwner ? (
        <CantEdit>{t('singleName.record.cantEdit')}</CantEdit>
      ) : (
        <AddRecord
          domain={domain}
          canEdit={canEditRecords}
          editing={editing}
          startEditing={startEditing}
          stopEditing={stopEditing}
          initialRecords={initialRecords}
          updatedRecords={updatedRecords}
          setUpdatedRecords={setUpdatedRecords}
          emptyRecords={emptyRecords}
        />
      )}

      <Coins
        canEdit={canEditRecords}
        editing={editing}
        domain={domain}
        mutation={SET_ADDR}
        addresses={updatedRecords.coins}
        loading={addressesLoading}
        title={t('c.addresses')}
        updatedRecords={updatedRecords}
        setUpdatedRecords={setUpdatedRecords}
        changedRecords={changedRecords}
      />
      {!isEmpty(domain.content) && (
        <ContentHash
          canEdit={canEditRecords}
          editing={editing}
          domain={domain}
          keyName="Content"
          type="content"
          mutation={contentMutation}
          value={domain.content}
          refetch={refetch}
          updatedRecords={updatedRecords}
          setUpdatedRecords={setUpdatedRecords}
          changedRecords={changedRecords}
        />
      )}
      <TextRecord
        canEdit={canEditRecords}
        editing={editing}
        domain={domain}
        mutation={SET_TEXT}
        textRecords={dataTextRecords && dataTextRecords.getTextRecords}
        loading={textRecordsLoading}
        title={t('c.textrecord')}
        updatedRecords={updatedRecords}
        setUpdatedRecords={setUpdatedRecords}
        changedRecords={changedRecords}
      />
      {console.log({ pending, confirmed: !confirmed, txHash })}
      {pending && !confirmed && txHash && (
        <ConfirmBox pending={pending}>
          <PendingTx
            txHash={txHash}
            onConfirmed={() => {
              setConfirmed()
              stopEditing()
            }}
          />
        </ConfirmBox>
      )}
      {editing && !txHash && (
        <ConfirmBox>
          <p>
            Add, delete, or edit one or multiple records. Confirm in one
            transaction.
          </p>
          <SaveCancel
            mutation={() => {
              addMultiRecords({
                variables: { name: domain.name, records: changedRecords }
              })
              //stopEditing(false)
            }}
            mutationButton="Confirm"
            stopEditing={stopEditing}
            disabled={false}
            confirm={true}
            extraDataComponent={
              <div>
                <p>Changing the following records:</p>
                {changedRecords.coins.length > 0 && <p>Updated addresses:</p>}
                {changedRecords.coins.map(record => (
                  <li>
                    {record.key} - {record.value}
                  </li>
                ))}
                {changedRecords.contentHash && (
                  <p>Content Hash: {changedRecords.contentHash}</p>
                )}
                {changedRecords.textRecords.length > 0 && (
                  <p>Updated text records:</p>
                )}
                {changedRecords.textRecords.map(record => (
                  <li>
                    {record.key} - {record.value}
                  </li>
                ))}
              </div>
            }
            isValid={haveRecordsChanged && areRecordsValid}
          />
        </ConfirmBox>
      )}
    </RecordsWrapper>
  )
}
