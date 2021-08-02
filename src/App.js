import React, { Fragment, useContext, useEffect, useState, lazy } from 'react'
import {
  HashRouter,
  BrowserRouter,
  Route as DefaultRoute,
  Switch
} from 'react-router-dom'
import { useQuery } from '@apollo/client'

const TestRegistrar = lazy(() => import('./routes/TestRegistrar'))
const Home = lazy(() => import('./routes/Home'))
const SearchResults = lazy(() => import('./routes/SearchResults'))
const SingleName = lazy(() => import('./routes/SingleName'))
const Favourites = lazy(() => import('./routes/Favourites'))
const Faq = lazy(() => import('./routes/Faq'))
const Address = lazy(() => import('./routes/AddressPage'))
const Renew = lazy(() => import('./routes/Renew'))

import { NetworkError, Error404 } from './components/Error/Errors'
import DefaultLayout from './components/Layout/DefaultLayout'
import { pageview, setup as setupAnalytics } from './utils/analytics'
import StackdriverErrorReporter from 'stackdriver-errors-js'
import GlobalState from './globalState'
import { setupClient } from 'apollo/apolloClient'
import gql from 'graphql-tag'
const errorHandler = new StackdriverErrorReporter()

// If we are targeting an IPFS build we need to use HashRouter
const Router =
  process.env.REACT_APP_IPFS === 'True' ? HashRouter : BrowserRouter

const HomePageLayout = ({ children }) => <Fragment>{children}</Fragment>

const Route = ({
  component: Component,
  layout: Layout = DefaultLayout,
  ...rest
}) => {
  pageview()
  return (
    <DefaultRoute
      {...rest}
      render={props => (
        <Layout>
          <Component {...props} />
        </Layout>
      )}
    />
  )
}

export const APP_DATA = gql`
  query getAppData {
    networkId @client
  }
`

const App = ({ initialClient, initialNetworkId }) => {
  useReactVarListeners()
  const appData = useQuery(APP_DATA)

  if (data && data.error && data.error.message) {
    return <NetworkError message={data.error.message} />
  }

  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} layout={HomePageLayout} />
          <Route path="/test-registrar" component={TestRegistrar} />
          <Route path="/favourites" component={Favourites} />
          <Route path="/faq" component={Faq} />
          <Route path="/my-bids" component={SearchResults} />
          <Route path="/how-it-works" component={SearchResults} />
          <Route path="/search/:searchTerm" component={SearchResults} />
          <Route path="/name/:name" component={SingleName} />
          <Route path="/address/:address/:domainType" component={Address} />
          <Route path="/address/:address" component={Address} />
          <Route path="/renew" component={Renew} />
          <Route path="*" component={Error404} />
        </Switch>
      </Router>
    </>
  )
}
export default App
