import React from 'react'
import { useMutation } from 'react-apollo'
import { MIGRATE_REGISTRY } from 'graphql/mutations'
import styled from '@emotion/styled'
import { ExternalButtonLink } from '../Forms/Button'

const WarningBox = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 100;
  color: #2b2b2b;
  padding: 20px 35px;
  background: hsla(37, 91%, 55%, 0.1);
  margin-bottom: 20px;
`

const WarningContent = styled('div')`
  width: calc(100% - 120px);
`

const Migrate = styled(ExternalButtonLink)`
  flex: 2 1 auto;
`

export default function MigrationWarning({ domain, account }) {
  const [mutation] = useMutation(MIGRATE_REGISTRY, {
    variables: { name: domain.name }
  })
  const canMigrate = account === domain.parentOwner
  return (
    <WarningBox>
      <WarningContent>
        This name needs to be migrated to the new Registry. Only the parent of
        the TLD can do this.
      </WarningContent>
      <Migrate
        onClick={canMigrate ? mutation : () => {}}
        type={canMigrate ? 'hollow-primary' : 'hollow-primary-disabled'}
        href="#"
      >
        Migrate
      </Migrate>
    </WarningBox>
  )
}
