import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache
} from '@apollo/client'
// import { InMemoryCache } from 'apollo-cache-inmemory'
import { withClientState } from 'apollo-link-state'

import resolvers, { defaults } from '../api/rootResolver'
import typeDefs from '../api/schema'
import typePolicies from './typePolicies'

let client

const cache = new InMemoryCache({
  typePolicies
})

const endpoints = {
  '1': 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  '3': 'https://api.thegraph.com/subgraphs/name/ensdomains/ensropsten',
  '4': 'https://api.thegraph.com/subgraphs/name/ensdomains/ensrinkeby',
  '5': 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli'
}

function getGraphQLAPI(network) {
  if (network > 100 && process.env.REACT_APP_GRAPH_NODE_URI) {
    return process.env.REACT_APP_GRAPH_NODE_URI
  }

  if (endpoints[network]) {
    return endpoints[network]
  }

  return endpoints['1']
}

// const stateLink = withClientState({
//   resolvers,
//   cache,
//   defaults,
//   typeDefs
// })

export function setupClient(network) {
  const httpLink = new HttpLink({
    uri: getGraphQLAPI(network)
  })
  const option = {
    cache,
    link: ApolloLink.from([httpLink], cache)
  }

  client = new ApolloClient(option)
  client.addResolvers({
    Mutation: {
      foo: (...args) => {
        console.log('resolver mut', ...args)
        return 1
      }
    }
  })
  return client
}

export default function getClient() {
  return client
}
