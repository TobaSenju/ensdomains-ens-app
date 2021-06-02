import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { CalendarButton } from '../Calendar/Calendar'
import Dropdown from '../Calendar/Dropdown'
import EmailNotifyLink from './EmailNotifyLink'
import Modal from '../Modal/Modal'
import ExpiryNotificationModal from './ExpiryNotificationModal'

const ExpiryNotifyDropdownContainer = styled('div')`
  position: relative;
`

export default function ExpiryNotifyDropdown({ address }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { t } = useTranslation()

  const handleDropdownClick = () => {
    setShowDropdown(value => !value)
  }

  const handleEmailNotifyClick = () => {
    setShowModal(true)
    setShowDropdown(false)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <ExpiryNotifyDropdownContainer>
      <CalendarButton onClick={handleDropdownClick}>
        {t('expiryNotification.reminder')}
      </CalendarButton>
      {showDropdown && (
        <Dropdown>
          <EmailNotifyLink
            onClick={handleEmailNotifyClick}
            key="email"
            address={address}
          >
            {t('c.email')}
          </EmailNotifyLink>
        </Dropdown>
      )}
      {showModal && (
        <Modal closeModal={handleCloseModal}>
          <ExpiryNotificationModal
            {...{ address, onCancel: handleCloseModal }}
          />
        </Modal>
      )}
    </ExpiryNotifyDropdownContainer>
  )
}
