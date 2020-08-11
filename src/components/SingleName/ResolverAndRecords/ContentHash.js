import React from 'react'
import PropTypes from 'prop-types'
import styled from '@emotion/styled/macro'
import { useTranslation } from 'react-i18next'

import { validateRecord } from 'utils/records'
import { emptyAddress } from 'utils/utils'
import mq from 'mediaQuery'

import { DetailsItem, DetailsKey, DetailsValue } from '../DetailsItem'
import AddReverseRecord from './AddReverseRecord'
import Upload from '../../IPFS/Upload'
import IpfsLogin from '../../IPFS/Login'
import StyledUpload from '../../Forms/Upload'
import ContentHashLink from '../../Links/ContentHashLink'
import Pencil from '../../Forms/Pencil'
import Bin from '../../Forms/Bin'
import RecordInput from '../RecordInput'
import CopyToClipBoard from '../../CopyToClipboard/'
import { useEditable } from '../../hooks'
import Button from '../../Forms/Button'

export const RecordsItem = styled(DetailsItem)`
  ${p => !p.hasRecord && 'display: none;'}
  ${p => (p.noBorder ? '' : 'border-top: 1px dashed #d3d3d3;')}
  display: block;
  padding: 20px;
  flex-direction: column;
  ${mq.small`
    align-items: flex-start;
  `}

  border-bottom: 1px dashed #d3d3d3;

  ${mq.medium`
    display: flex;
    flex-direction: column;
  `}
`

export const RecordsContent = styled('div')`
  display: grid;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  ${mq.medium`
    display: flex;
  `}
  ${({ editing }) => editing && 'margin-bottom: 30px'};
`

export const RecordsKey = styled(DetailsKey)`
  font-size: 12px;
  margin-bottom: 0;
  max-width: 100%;
  margin-right: 10px;
  ${mq.medium`
    width: 180px;
    margin-right: 0px;
  `}
`

export const RecordsSubKey = styled('div')`
  font-family: Overpass Mono;
  font-weight: 500;
  font-size: 14px;
  color: #adbbcd;
  letter-spacing: 0;

  ${mq.small`
    font-size: 16px;
    max-width: 220px;
    min-width: 180px;
  `}
`

export const RecordsValue = styled(DetailsValue)`
  font-size: 14px;
  margin-top: 1em;
  ${mq.small`
      margin-top: 0;
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

const EditRecord = styled('div')`
  width: 100%;
`

const Action = styled('div')`
  margin-left: 0;
  ${mq.small`
    margin-left: auto;
  `};
`

const SecondaryAction = styled('div')`
  margin-right: 10px;
`

const Uploadable = ({ startUploading, keyName, value }) => {
  if (value && !value.error) {
    return (
      <SecondaryAction>
        <StyledUpload
          onClick={startUploading}
          data-testid={`edit-upload-temporal`}
        />
      </SecondaryAction>
    )
  }
  return null
}

const Switch = styled(Button)`
  margin-bottom: 5px;
  ${mq.small`
    margin-right: 20px;
    margin-bottom: 0px; 
  `}
`

const ContentHashEditable = ({
  domain,
  keyName,
  value,
  type,

  variableName,
  account,
  editing,
  updatedRecords,
  setUpdatedRecords
}) => {
  const { t } = useTranslation()
  const { state, actions } = useEditable()

  const { authorized, uploading, newValue } = state

  const {
    startUploading,
    stopUploading,
    startAuthorizing,
    stopAuthorizing,
    updateValue
  } = actions

  const isValid = validateRecord({
    type,
    value,
    contentType: domain.contentType
  })

  const isInvalid = value !== '' && !isValid

  return (
    <>
      <RecordsItem editing={editing} hasRecord={true}>
        <RecordsContent editing={editing}>
          <RecordsKey>{t(`c.${keyName}`)}</RecordsKey>
          {!editing && (
            <RecordsValue editableSmall>
              <ContentHashLink value={value} contentType={domain.contentType} />
              <CopyToClipBoard value={value} />
            </RecordsValue>
          )}

          {editing ? (
            <>
              <EditRecord>
                <RecordInput
                  onChange={event => {
                    const value = event.target.value
                    setUpdatedRecords(records => ({
                      ...records,
                      contentHash: value
                    }))
                  }}
                  value={updatedRecords.contentHash}
                  dataType={type}
                  contentType={domain.contentType}
                  isValid={isValid}
                  isInvalid={isInvalid}
                />

                <Uploadable
                  startUploading={startUploading}
                  keyName={keyName}
                  value={value}
                />
                {uploading && !authorized && (
                  <>
                    hello
                    <IpfsLogin startAuthorizing={startAuthorizing} />
                  </>
                )}

                {uploading && authorized && (
                  <>
                    <Upload
                      updateValue={value => {
                        updateValue(value)
                        setUpdatedRecords(records => {
                          return {
                            ...records,
                            contentHash: value
                          }
                        })
                      }}
                      newValue={newValue}
                    />
                    {value !== '' && (
                      <NewRecordsContainer>
                        <RecordsKey>New IPFS Hash:</RecordsKey>
                        <ContentHashLink
                          value={value}
                          contentType={domain.contentType}
                        />
                      </NewRecordsContainer>
                    )}
                    {value !== '' && (
                      <Switch
                        data-testid="reset"
                        type="hollow"
                        onClick={startUploading}
                      >
                        New Upload
                      </Switch>
                    )}
                    <Switch
                      data-testid="switch"
                      type="hollow"
                      onClick={stopAuthorizing}
                    >
                      Logout
                    </Switch>
                    <Switch
                      data-testid="cancel"
                      type="hollow"
                      onClick={stopUploading}
                    >
                      Cancel
                    </Switch>
                    }
                  </>
                )}
              </EditRecord>

              {/* <SaveCancel
              warningMessage={getOldContentWarning(type, domain.contentType)}
              mutation={e => {
                e.preventDefault()
                const variables = {
                  name: domain.name,
                  [variableName ? variableName : 'recordValue']: newValue
                }
                mutation({
                  variables
                })
              }}
              isValid={isValid}
              stopEditing={stopEditing}
            /> */}
            </>
          ) : uploading && authorized ? (
            <>
              <EditRecord>
                <Upload
                  updateValue={value => {
                    setUpdatedRecords(records => {
                      return {
                        ...records,
                        contentHash: value
                      }
                    })
                  }}
                  newValue={value}
                />
                {value !== '' && (
                  <NewRecordsContainer>
                    <RecordsKey>New IPFS Hash:</RecordsKey>
                    <ContentHashLink
                      value={value}
                      contentType={domain.contentType}
                    />
                  </NewRecordsContainer>
                )}
              </EditRecord>
            </>
          ) : (
            ''
          )}
          {editing && (
            <Action>
              <Bin
                data-testid={`delete-${type.toLowerCase()}`}
                onClick={e => {
                  e.preventDefault()
                  setUpdatedRecords(records => {
                    return {
                      ...records,
                      contentHash: emptyAddress
                    }
                  })
                }}
              />
            </Action>
          )}
        </RecordsContent>

        {keyName === 'Address' && (
          <AddReverseRecord account={account} name={domain.name} />
        )}
      </RecordsItem>
    </>
  )
}

function ContentHashViewOnly({ keyName, value, type, domain, account }) {
  const { name, contentType } = domain
  const { t } = useTranslation()
  return keyName !== 'Address' && contentType === 'error' ? (
    ''
  ) : (
    <RecordsItem>
      <RecordsContent>
        <RecordsKey>{t(`c.${keyName}`)}</RecordsKey>
        <RecordsValue>
          <ContentHashLink value={value} contentType={contentType} />
          )}
          <CopyToClipBoard value={value} />
        </RecordsValue>
        <Action>
          <Pencil
            disabled={true}
            data-testid={`edit-${keyName.toLowerCase()}`}
          />
        </Action>
      </RecordsContent>
      {keyName === 'Address' &&
        value.toLowerCase() === account.toLowerCase() && (
          <AddReverseRecord account={account} name={name} />
        )}
    </RecordsItem>
  )
}

function ContentHash(props) {
  const { canEdit } = props
  if (canEdit) return <ContentHashEditable {...props} />

  return <ContentHashViewOnly {...props} />
}

ContentHash.propTypes = {
  keyName: PropTypes.string.isRequired, // key of the record
  value: PropTypes.string.isRequired, // value of the record (normally hex address)
  type: PropTypes.string, // type of value. Defaults to address
  editButton: PropTypes.string, //Edit button text
  domain: PropTypes.object.isRequired,
  variableName: PropTypes.string, //can change the variable name for mutation
  account: PropTypes.string
}

export default ContentHash
