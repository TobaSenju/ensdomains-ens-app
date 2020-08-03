import React, { useState } from 'react'
import styled from '@emotion/styled/macro'
import { Mutation } from 'react-apollo'
import mq from 'mediaQuery'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'

import { validateRecord } from '../../../utils/records'
import { useEditable } from '../../hooks'
import {
  SET_CONTENT,
  SET_CONTENTHASH,
  SET_ADDRESS,
  SET_ADDR,
  SET_TEXT
} from '../../../graphql/mutations'
import { getOldContentWarning } from './warnings'
import TEXT_RECORD_KEYS from 'constants/textRecords'
import COIN_LIST from 'constants/coinList'
import { getEnsAddress } from '../../../api/ens'

import Upload from '../../IPFS/Upload'
import IpfsLogin from '../../IPFS/Login'
import Button from '../../Forms/Button'
import ContentHashLink from '../../Links/ContentHashLink'
import { DetailsKey } from '../DetailsItem'
import DetailsItemInput from '../DetailsItemInput'
import { SaveCancel, SaveCancelSwitch } from '../SaveCancel'
import DefaultSelect from '../../Forms/Select'
import PendingTx from '../../PendingTx'
import DefaultAddressInput from '@ensdomains/react-ens-address'

const AddressInput = styled(DefaultAddressInput)`
  margin-bottom: 10px;
`

const ToggleAddRecord = styled('span')`
  font-size: 22px;

  &:hover {
    cursor: pointer;
  }
`

const Select = styled(DefaultSelect)`
  margin-right: 20px;
  flex-direction: row;
  margin-bottom: 10px;
  width: 100%;
  ${mq.small`
    margin-bottom: 0px;
    max-width: 150px;
  `}
`

const RecordsTitle = styled('h3')`
  /* Pointers: */
  font-family: Overpass;
  font-weight: 700;
  font-size: 12px;
  color: #adbbcd;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const AddRecordContainer = styled('div')`
  background: #f0f6fa;
`

const AddRecordForm = styled('form')`
  padding: 20px;
`

const Row = styled('div')`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-direction: column;
  ${mq.small`
    flex-direction: row;
  `}
`

const NewRecordsContainer = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  padding-top: 20px;
  padding-bottom: 20px;
  font-size: 21px;
  overflow: hidden;
  ${mq.medium`
    flex-direction: row;
    justify-content: center;
    align-items: center;
  `}
`

export const RecordsKey = styled(DetailsKey)`
  font-size: 12px;
  margin-bottom: 0;
  max-width: 100%;
  margin-right: 10px;
  ${mq.medium`
    width: 200px;
    margin-right: 0px;
  `}
`
const UploadBtn = styled(Button)`
  flex-direction: row;
  margin-bottom: 5px;
  width: 100%;
  background: #5284ff;
  ${mq.small`
    margin-left: 20px;
    margin-bottom: 20px;
    max-width: 150px;
  `}
`

function chooseMutation(recordType, contentType) {
  switch (recordType.value) {
    case 'content':
      if (contentType === 'oldcontent') {
        return SET_CONTENT
      } else {
        return SET_CONTENTHASH
      }
    case 'coins':
      return SET_ADDR
    case 'text':
      return SET_TEXT
    default:
      throw new Error('Not a recognised record type')
  }
}

function TextRecordInput({
  selectedRecord,
  updateValue,
  newValue,
  selectedKey,
  setSelectedKey,
  isValid,
  isInvalid
}) {
  return (
    <>
      <Select
        selectedRecord={selectedKey}
        handleChange={setSelectedKey}
        placeholder="Key"
        addNewKey={true}
        options={TEXT_RECORD_KEYS.map(key => ({
          label: key,
          value: key
        }))}
      />
      <DetailsItemInput
        newValue={newValue}
        dataType={selectedRecord ? selectedRecord.value : null}
        updateValue={updateValue}
        isValid={isValid}
        isInvalid={isInvalid}
        placeholder={selectedKey ? `Enter ${selectedKey.value}` : ''}
      />
    </>
  )
}

function AddressRecordInput({
  selectedRecord,
  updateValue,
  newValue,
  selectedKey,
  setSelectedKey,
  isValid,
  isInvalid
}) {
  return (
    <>
      <Select
        selectedRecord={selectedKey}
        handleChange={setSelectedKey}
        placeholder="Coin"
        options={COIN_LIST.map(key => ({
          label: key,
          value: key
        }))}
      />
      <DetailsItemInput
        newValue={newValue}
        dataType={selectedRecord ? selectedRecord.value : null}
        updateValue={updateValue}
        isValid={isValid}
        isInvalid={isInvalid}
        placeholder={selectedKey ? `Enter a ${selectedKey.value} address` : ''}
      />
    </>
  )
}

function Editable({
  domain,
  emptyRecords,
  refetch,
  setRecordAdded,
  canEdit,
  editMode,
  setEditMode,
  updatedRecords,
  setUpdatedRecords
}) {
  const [selectedRecord, selectRecord] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)
  const { state, actions } = useEditable()

  const handleChange = selectedRecord => {
    selectRecord(selectedRecord)
  }

  console.log({ selectedKey })

  const handleSubmit = e => {
    e.preventDefault()
  }

  const { uploading, authorized, newValue, txHash } = state

  const {
    startUploading,
    stopUploading,
    startAuthorizing,
    stopAuthorizing,
    updateValue
    // startPending,
    // setConfirmed
  } = actions

  function startEditing() {
    setEditMode(true)
  }

  function stopEditing() {
    setEditMode(false)
  }

  const isValid = validateRecord({
    type: selectedRecord && selectedRecord.value ? selectedRecord.value : null,
    value: newValue,
    contentType: domain.contentType,
    selectedKey: selectedKey && selectedKey.value
  })

  function saveRecord(selectedRecord, selectedKey, newValue) {
    function createRecordObj({
      selectedRecord,
      selectedKey,
      newValue,
      records
    }) {
      if (selectedRecord === 'content') {
        return newValue
      } else {
        const exists = records[selectedRecord.value].find(
          record => record.key === selectedKey.value
        )

        console.log({ selectedKey, records: records[selectedRecord.value] })
        if (exists) {
          return records[selectedRecord.value].map(record =>
            record.key === selectedKey.value
              ? { ...record, value: newValue }
              : record
          )
        } else {
          return [
            ...records[selectedRecord.value],
            { key: selectedKey.value, value: newValue }
          ]
        }
      }
    }
    setUpdatedRecords(records => {
      const newRecord = createRecordObj({
        selectedRecord,
        selectedKey,
        newValue,
        records
      })
      console.log({ newRecord })
      return { ...records, [selectedRecord.value]: newRecord }
    })
    setSelectedKey(null)
    selectRecord(null)
  }

  const { t } = useTranslation()
  const isInvalid = newValue !== '' && !isValid
  return (
    <>
      <RecordsTitle>
        {t('singleName.record.title')}
        {editMode ? (
          <ToggleAddRecord onClick={stopEditing}>
            Close Edit Record
          </ToggleAddRecord>
        ) : (
          <ToggleAddRecord onClick={startEditing}>
            Add/Edit Record
          </ToggleAddRecord>
        )}
      </RecordsTitle>
      {editMode && (
        <AddRecordForm onSubmit={handleSubmit}>
          <Row>
            <Select
              selectedRecord={selectedRecord}
              handleChange={handleChange}
              placeholder="Select a record"
              options={emptyRecords}
            />
            {selectedRecord && selectedRecord.value === 'coins' ? (
              <AddressRecordInput
                selectedRecord={selectedRecord}
                newValue={newValue}
                updateValue={updateValue}
                selectedKey={selectedKey}
                setSelectedKey={setSelectedKey}
                isValid={isValid}
                isInvalid={isInvalid}
              />
            ) : selectedRecord &&
              uploading &&
              authorized &&
              selectedRecord.value === 'content' ? (
              <Upload updateValue={updateValue} newValue={newValue} />
            ) : selectedRecord &&
              uploading &&
              !authorized &&
              selectedRecord.value === 'content' ? (
              <IpfsLogin startAuthorizing={startAuthorizing} />
            ) : selectedRecord && selectedRecord.value === 'content' ? (
              <>
                <DetailsItemInput
                  newValue={newValue}
                  dataType={selectedRecord ? selectedRecord.value : null}
                  contentType={domain.contentType}
                  updateValue={updateValue}
                  isValid={isValid}
                  isInvalid={isInvalid}
                />
                <UploadBtn
                  data-testid="upload"
                  type="hollow"
                  onClick={startUploading}
                >
                  New Upload
                </UploadBtn>
              </>
            ) : selectedRecord && selectedRecord.value === 'address' ? (
              <AddressInput
                provider={
                  window.ethereum || window.web3 || 'http://localhost:8545'
                }
                onResolve={({ address }) => {
                  if (address) {
                    updateValue(address)
                  } else {
                    updateValue('')
                  }
                }}
                ensAddress={getEnsAddress()}
              />
            ) : selectedRecord && selectedRecord.value === 'text' ? (
              <TextRecordInput
                selectedRecord={selectedRecord}
                newValue={newValue}
                updateValue={updateValue}
                selectedKey={selectedKey}
                setSelectedKey={setSelectedKey}
                isValid={isValid}
                isInvalid={isInvalid}
              />
            ) : (
              <DetailsItemInput
                newValue={newValue}
                dataType={selectedRecord ? selectedRecord.value : null}
                contentType={domain.contentType}
                updateValue={updateValue}
                isValid={isValid}
                isInvalid={isInvalid}
              />
            )}
          </Row>
          {selectedRecord &&
            uploading &&
            authorized &&
            selectedRecord.value === 'content' &&
            newValue !== '' && (
              <NewRecordsContainer>
                <RecordsKey>New IPFS Hash:</RecordsKey>
                <ContentHashLink
                  value={newValue}
                  contentType={domain.contentType}
                />
              </NewRecordsContainer>
            )}
          {uploading && !authorized && selectedRecord.value === 'content' ? (
            <SaveCancel stopEditing={stopUploading} disabled />
          ) : selectedRecord ? (
            <>
              {uploading && authorized && selectedRecord.value === 'content' ? (
                <SaveCancelSwitch
                  warningMessage={getOldContentWarning(
                    selectedRecord.value,
                    domain.contentType
                  )}
                  isValid={isValid}
                  newValue={newValue}
                  startUploading={startUploading}
                  stopUploading={stopUploading}
                  stopAuthorizing={stopAuthorizing}
                />
              ) : (
                <button
                  onClick={() =>
                    saveRecord(selectedRecord, selectedKey, newValue)
                  }
                >
                  Save
                </button>
              )}
            </>
          ) : (
            <SaveCancel stopEditing={stopEditing} disabled />
          )}
        </AddRecordForm>
      )}
    </>
  )
}

function AddRecord(props) {
  const { canEdit } = props
  const { t } = useTranslation()
  return canEdit ? (
    <AddRecordContainer>
      <Editable {...props} />
    </AddRecordContainer>
  ) : (
    <AddRecordContainer>
      <RecordsTitle>{t('singleName.record.title')}</RecordsTitle>
    </AddRecordContainer>
  )
}

export default AddRecord
