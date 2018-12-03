import Web3 from 'web3'

let web3
let web3Read
let readOnly = false

export default async function getWeb3(customProvider) {
  if (web3) {
    return web3
  }

  if (customProvider) {
    //for testing
    web3 = new Web3(customProvider)
    web3Read = web3
    try {
      await web3.eth.net.getId()
    } catch (e) {
      console.log('error setting up web3')
    }
    return web3
  }

  if (window && window.ethereum) {
    web3 = new Web3(window.ethereum)
    const id = `${await web3.eth.net.getId()}`
    web3Read = new Web3(getNetworkProviderUrl(id))
    return web3
  } else if (window.web3 && window.web3.currentProvider) {
    web3 = new Web3(window.web3.currentProvider)
    const id = `${await web3.eth.net.getId()}`
    web3Read = new Web3(getNetworkProviderUrl(id))
    return web3
  } else {
    console.log('No web3 instance injected. Falling back to cloud provider.')
    readOnly = true
    web3 = new Web3(getNetworkProviderUrl('1'))
    web3Read = web3
    return web3
  }
}

export async function getWeb3Read() {
  if (web3Read) {
    return web3Read
  }
  await getWeb3()
  return web3Read
}

export function isReadOnly() {
  return readOnly
}

function getNetworkProviderUrl(id) {
  switch (id) {
    case '1':
      return `https://mainnet.infura.io/`
    case '3':
      return `https://ropsten.infura.io/`
    case '4':
      return `https://rinkeby.infura.io/`
    default:
      throw new Error(`Cannot connect to unsupported network: ${id}`)
  }
}

export async function getAccount() {
  const accounts = await getAccounts()
  return accounts[0]
}

export async function getAccounts() {
  try {
    const web3 = await getWeb3()
    const accounts = await web3.eth.getAccounts()

    if (accounts.length > 0) {
      return accounts
    } else if (window.ethereum) {
      try {
        const accounts = await window.ethereum.enable()
        return accounts
      } catch (error) {
        console.warn('Did not allow app to access dapp browser')
        throw error
      }
    } else {
      return []
    }
  } catch (_) {
    return []
  }
}

export async function getNetworkId() {
  const web3 = await getWeb3()
  return web3.eth.net.getId()
}
