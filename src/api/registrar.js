import getENS, { getNamehash } from './ens'
import getWeb3, { getWeb3Read, getAccount, getNetworkId } from './web3'
import { abi as auctionRegistrarContract } from '@ensdomains/ens/build/contracts/HashRegistrar'
import { abi as permanentRegistrarContract } from '@ensdomains/ethregistrar/build/contracts/BaseRegistrarImplementation'
import { abi as permanentRegistrarControllerContract } from '@ensdomains/ethregistrar/build/contracts/ETHRegistrarController'

let ethRegistrar
let ethRegistrarRead
let permanentRegistrar
let permanentRegistrarRead
let permanentRegistrarController
let permanentRegistrarControllerRead

export const getAuctionRegistrar = async () => {
  if (ethRegistrar) {
    return {
      ethRegistrar,
      ethRegistrarRead
    }
  }
  try {
    const web3 = await getWeb3()
    const networkId = await getNetworkId()
    const web3Read = await getWeb3Read()

    let legacyAuctionRegistrarAddress

    if (process.env.REACT_APP_AUCTION_REGISTRAR_ADDRESS && networkId > 1000) {
      //Assuming public main/test networks have a networkId of less than 1000
      legacyAuctionRegistrarAddress =
        process.env.REACT_APP_AUCTION_REGISTRAR_ADDRESS
    } else {
      throw new Error('No auction address found')
    }
    ethRegistrar = new web3.eth.Contract(
      auctionRegistrarContract,
      legacyAuctionRegistrarAddress
    )
    ethRegistrarRead = new web3Read.eth.Contract(
      auctionRegistrarContract,
      legacyAuctionRegistrarAddress
    )
    return {
      ethRegistrar,
      ethRegistrarRead
    }
  } catch (e) {}
}

export const getPermanentRegistrar = async () => {
  if (permanentRegistrar) {
    return {
      permanentRegistrar: permanentRegistrar.methods,
      permanentRegistrarRead: permanentRegistrarRead.methods
    }
  }

  try {
    const { readENS: ENS } = await getENS()
    const web3 = await getWeb3()
    const web3Read = await getWeb3Read()
    const ethAddr = await ENS.owner(await getNamehash('eth')).call()
    permanentRegistrar = new web3.eth.Contract(
      permanentRegistrarContract,
      ethAddr
    )
    permanentRegistrarRead = new web3Read.eth.Contract(
      permanentRegistrarContract,
      ethAddr
    )
    return {
      permanentRegistrar: permanentRegistrar.methods,
      permanentRegistrarRead: permanentRegistrarRead.methods
    }
  } catch (e) {}
}

export const getPermanentRegistrarController = async () => {
  if (permanentRegistrarController) {
    return {
      permanentRegistrarController: permanentRegistrarController.methods,
      _permanentRegistrarController: permanentRegistrarController,
      permanentRegistrarControllerRead:
        permanentRegistrarControllerRead.methods,
      _permanentRegistrarControllerRead: permanentRegistrarControllerRead
    }
  }

  try {
    const web3 = await getWeb3()
    const web3Read = await getWeb3Read()
    const networkId = await getNetworkId()
    let controllerAddress
    if (process.env.REACT_APP_CONTROLLER_ADDRESS && networkId > 1000) {
      //Assuming public main/test networks have a networkId of less than 1000
      controllerAddress = process.env.REACT_APP_CONTROLLER_ADDRESS
    } else {
      throw new Error('No controller address found')
    }

    permanentRegistrarController = new web3.eth.Contract(
      permanentRegistrarControllerContract,
      controllerAddress
    )

    permanentRegistrarControllerRead = new web3Read.eth.Contract(
      permanentRegistrarControllerContract,
      controllerAddress
    )
    return {
      permanentRegistrarController: permanentRegistrarController.methods,
      _permanentRegistrarController: permanentRegistrarController,
      permanentRegistrarControllerRead:
        permanentRegistrarControllerRead.methods,
      _permanentRegistrarControllerRead: permanentRegistrarControllerRead
    }
  } catch (e) {}
}

export const getPermanentEntry = async name => {
  let obj = {
    available: null,
    nameExpires: null
  }
  try {
    const web3 = await getWeb3()
    const namehash = web3.utils.sha3(name)
    const { permanentRegistrarRead: Registrar } = await getPermanentRegistrar()
    obj.available = await Registrar.available(namehash).call()
    const nameExpires = await Registrar.nameExpires(namehash).call()
    if (nameExpires > 0) {
      obj.nameExpires = new Date(nameExpires * 1000)
    }
  } catch (e) {
    console.log('error getting permanentRegistrar contract', e)
  }
  return obj
}

export const getEntry = async name => {
  const { ethRegistrarRead: Registrar } = await getAuctionRegistrar()
  let obj

  const web3 = await getWeb3()
  const namehash = web3.utils.sha3(name)
  try {
    const entry = await Registrar.methods.entries(namehash).call()
    obj = {
      state: parseInt(entry[0]),
      registrationDate: parseInt(entry[2]) * 1000,
      revealDate: (parseInt(entry[2]) - 24 * 2 * 60 * 60) * 1000,
      value: parseInt(entry[3]),
      highestBid: parseInt(entry[4]),
      _entry: entry
    }
  } catch (e) {
    console.log('error getting auction entry', e)
    obj = {
      state: 0,
      registrationDate: 0,
      revealDate: 0,
      value: 0,
      highestBid: 0,
      expiryTime: 0
    }
  }
  try {
    let permEntry = await getPermanentEntry(name)
    if (!permEntry.available) {
      // Owned
      obj.state = 2
    }
    if (permEntry.nameExpires) {
      obj.expiryTime = permEntry.nameExpires
    }
  } catch (e) {
    console.log('error getting permanent registry', e)
  }
  return obj
}

export const getRentPrice = async (name, duration) => {
  const {
    permanentRegistrarControllerRead
  } = await getPermanentRegistrarController()

  const price = await permanentRegistrarControllerRead
    .rentPrice(name, duration)
    .call()

  return price
}

export const getMinimumCommitmentAge = async () => {
  const {
    permanentRegistrarControllerRead
  } = await getPermanentRegistrarController()
  return await permanentRegistrarControllerRead.minCommitmentAge().call()
}

export const makeCommitment = async (name, owner, secret = '') => {
  const {
    permanentRegistrarControllerRead
  } = await getPermanentRegistrarController()

  const commitment = await permanentRegistrarControllerRead
    .makeCommitment(name, owner, secret)
    .call()

  return commitment
}

export const commit = async (name, secret = '') => {
  const {
    permanentRegistrarController
  } = await getPermanentRegistrarController()
  const account = await getAccount()

  const commitment = await makeCommitment(name, account, secret)

  return () =>
    permanentRegistrarController.commit(commitment).send({ from: account })
}

export const register = async (name, duration, secret) => {
  const {
    permanentRegistrarController
  } = await getPermanentRegistrarController()
  const account = await getAccount()
  const price = await getRentPrice(name, duration)

  return () =>
    permanentRegistrarController
      .register(name, account, duration, secret)
      .send({ from: account, gas: 1000000, value: price })
}

export const createSealedBid = async (name, bidAmount, secret) => {
  const Registrar = await getAuctionRegistrar()
  const web3 = await getWeb3()
  const account = await getAccount()
  const namehash = web3.sha3(name)

  return Registrar.methods
    .shaBid(
      namehash,
      account,
      web3.utils.toWei(bidAmount, 'ether'),
      web3.utils.sha3(secret)
    )
    .send({ from: account })
}

export const newBid = async (sealedBid, decoyBidAmount) => {
  const Registrar = await getAuctionRegistrar()
  const web3 = await getWeb3()
  const account = await getAccount()

  return Registrar.methodsnewBid(sealedBid).send({
    from: account,
    value: web3.utils.toWei(decoyBidAmount, 'ether')
  })
}

export const startAuctionsAndBid = async (
  hashes,
  sealedBid,
  decoyBidAmount
) => {
  const Registrar = await getAuctionRegistrar()
  const web3 = await getWeb3()
  const account = await getAccount()

  return Registrar.startAuctionsAndBid(hashes, sealedBid()).send({
    from: account,
    value: web3.utils.toWei(decoyBidAmount, 'ether')
  })
}
