import WalletConnectProvider from '@walletconnect/web3-provider'
// import Authereum from 'authereum'
// import MewConnect from '@myetherwallet/mewconnect-web-client'
// import Torus from '@toruslabs/torus-embed'
// import Portis from '@portis/web3'

import Web3Modal from 'web3modal'
import { setup as setupENS } from '../api/ens'
import { getNetwork } from '@ensdomains/ui'

const INFURA_ID =
  window.location.host === 'app.ens.domains'
    ? '90f210707d3c450f847659dc9a3436ea'
    : '58a380d3ecd545b2b5b3dad5d2b18bf0'
const PORTIS_ID = '57e5d6ca-e408-4925-99c4-e7da3bdb8bf5'
let provider
const option = {
  network: 'mainnet', // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      // package: () => import('@walletconnect/web3-provider'),
      options: {
        infuraId: INFURA_ID
      }
    },
    //Alphabetical order from now on.
    authereum: {
      package: () => import('authereum')
    },
    mewconnect: {
      package: () => import('@myetherwallet/mewconnect-web-client'),
      options: {
        infuraId: INFURA_ID,
        description: ' '
      }
    },
    portis: {
      package: () => import('@portis/web3'),
      options: {
        id: PORTIS_ID
      }
    },
    torus: {
      package: () => import('@toruslabs/torus-embed')
    }
  }
}
let web3Modal
export const connect = async () => {
  try {
    debugger
    web3Modal = new Web3Modal(option)
    provider = await web3Modal.connect()
    provider.on('accountsChanged', accounts => {
      window.location.reload()
    })

    await setupENS({
      customProvider: provider,
      reloadOnAccountsChange: true,
      enforceReload: true
    })
    return await getNetwork()
  } catch (e) {
    if (e !== 'Modal closed by user') {
      debugger
      throw e
    }
  }
}

export const disconnect = async function() {
  // Disconnect wallet connect provider
  if (provider && provider.disconnect) {
    provider.disconnect()
  }
  await setupENS({
    reloadOnAccountsChange: true,
    enforceReadOnly: true,
    enforceReload: true
  })
  if (web3Modal) {
    await web3Modal.clearCachedProvider()
  }
}
