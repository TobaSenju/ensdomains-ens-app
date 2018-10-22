import React, { Fragment, Component } from 'react'
import styled from 'react-emotion'
import { Link, Route } from 'react-router-dom'

import { HR } from '../Typography/Basic'
import SubDomains from './SubDomains'
import { DetailsItem, DetailsKey, DetailsValue } from './DetailsItem'
import RecordsItem from './RecordsItem'
import DetailsItemEditable from './DetailsItemEditable'
import AddRecord from './AddRecord'

import {
  SET_OWNER,
  SET_RESOLVER,
  SET_ADDRESS,
  SET_CONTENT
} from '../../graphql/mutations'

import { formatDate } from '../../utils/dates'

const Details = styled('section')`
  padding: 40px;
  transition: 0.4s;
`

const Records = styled('div')`
  border-radius: 6px;
  border: 1px solid #ededed;
  box-shadow: inset 0 0 10px 0 rgba(235, 235, 235, 0.5);
`

class NameDetails extends Component {
  isEmpty(record) {
    if (parseInt(record, 16) === 0) {
      return true
    }
    if (record === '0x') {
      return true
    }

    return false
  }
  hasAnyRecord(domain) {
    if (parseInt(domain.resolver, 16) === 0) {
      return false
    }
    if (!this.isEmpty(domain.addr)) {
      return true
    }

    if (!this.isEmpty(domain.content)) {
      return true
    }
  }
  render() {
    const { domain, isOwner, refetch } = this.props
    return (
      <Fragment>
        <Route
          exact
          path="/name/:name"
          render={() => (
            <Details>
              {domain.parent && (
                <DetailsItem>
                  <DetailsKey>Parent</DetailsKey>
                  <DetailsValue>
                    <Link to={`/name/${domain.parent}`}>{domain.parent}</Link>
                  </DetailsValue>
                </DetailsItem>
              )}
              <DetailsItemEditable
                domain={domain}
                keyName="Owner"
                value={domain.owner}
                isOwner={isOwner}
                editButton="Transfer"
                mutationButton="Transfer"
                mutation={SET_OWNER}
                mutationName="setOwner"
                event="Transfer"
                refetch={refetch}
              />
              {domain.registrationDate ? (
                <DetailsItem>
                  <DetailsKey>Registration Date</DetailsKey>
                  <DetailsValue>
                    {formatDate(domain.registrationDate)}
                  </DetailsValue>
                </DetailsItem>
              ) : (
                ''
              )}
              <HR />
              <DetailsItemEditable
                keyName="Resolver"
                value={domain.resolver}
                isOwner={isOwner}
                domain={domain}
                mutationButton="Save"
                mutation={SET_RESOLVER}
                mutationName="setResolver"
                event="NewResolver"
                refetch={refetch}
              />
              <Records>
                <AddRecord title="Records" isOwner={isOwner} domain={domain} />
                {this.hasAnyRecord(domain) && (
                  <>
                    {!this.isEmpty(domain.addr) && (
                      <RecordsItem
                        isOwner={isOwner}
                        keyName="Address"
                        value={domain.addr}
                        type="address"
                      />
                    )}
                    {!this.isEmpty(domain.content) && (
                      <RecordsItem
                        isOwner={isOwner}
                        keyName="Content"
                        value={domain.content}
                      />
                    )}
                  </>
                )}
              </Records>
            </Details>
          )}
        />

        <Route
          exact
          path="/name/:name/subdomains"
          render={() => <SubDomains domain={domain} />}
        />
      </Fragment>
    )
  }
}
export default NameDetails
