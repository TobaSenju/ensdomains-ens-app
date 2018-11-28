const fs = require('fs')

module.exports = async function deployENS({ web3, accounts }) {
  const { sha3 } = web3.utils
  function deploy(contractJSON, ...args) {
    const contract = new web3.eth.Contract(JSON.parse(contractJSON.interface))
    return contract
      .deploy({
        data: contractJSON.bytecode,
        arguments: args
      })
      .send({
        from: accounts[0],
        gas: 4700000
      })
  }

  function namehash(name) {
    let node =
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    if (name !== '') {
      let labels = name.split('.')
      for (let i = labels.length - 1; i >= 0; i--) {
        node = sha3(node + sha3(labels[i]).slice(2), {
          encoding: 'hex'
        })
      }
    }
    return node.toString()
  }

  // This code compiles the deployer contract directly
  // If the deployer contract needs updating you can run
  // `npm run compile2` to compile it to ./src/testing-utils/contracts/ENS.json
  //
  // let source = fs.readFileSync('./src/api/__tests__/ens.sol').toString()
  // let compiled = solc.compile(source, 1)
  const { contracts } = JSON.parse(
    fs.readFileSync('./src/testing-utils/ENS.json')
  )

  const registryJSON = contracts['ENSRegistry.sol:ENSRegistry']
  const resolverJSON = contracts['PublicResolver.sol:PublicResolver']
  const reverseRegistrarJSON =
    contracts['ReverseRegistrar.sol:ReverseRegistrar']

  /* Deploy the main contracts  */

  const ens = await deploy(registryJSON)
  const resolver = await deploy(resolverJSON, ens._address)
  const reverseRegistrar = await deploy(
    reverseRegistrarJSON,
    ens._address,
    resolver._address
  )

  const ensContract = ens.methods
  const resolverContract = resolver.methods
  const reverseRegistrarContract = reverseRegistrar.methods

  console.log('ENS registry deployed at: ', ens._address)
  console.log('Public resolver deployed at: ', resolver._address)
  console.log('Reverse Registrar deployed at: ', reverseRegistrar._address)

  const tld = 'eth'
  const tldHash = sha3(tld)

  /* Setup the root TLD */

  await ensContract
    .setSubnodeOwner('0x00000000000000000000000000000000', tldHash, accounts[0])
    .send({
      from: accounts[0]
    })

  /* Setup the root reverse node */
  await ensContract
    .setSubnodeOwner(
      '0x00000000000000000000000000000000',
      sha3('reverse'),
      accounts[0]
    )
    .send({
      from: accounts[0]
    })

  /* Setup the reverse subdomain: addr.reverse */

  await ensContract
    .setSubnodeOwner(
      namehash('reverse'),
      sha3('addr'),
      reverseRegistrar._address
    )
    .send({
      from: accounts[0]
    })

  /* Register the subdomain resolver.eth */

  await ensContract
    .setSubnodeOwner(namehash('eth'), sha3('resolver'), accounts[0])
    .send({
      from: accounts[0]
    })

  /* Point the resolver.eth's resolver to the public resolver */

  await ensContract
    .setResolver(namehash('resolver.eth'), resolver._address)
    .send({
      from: accounts[0]
    })

  /* Resolve the resolver.eth address to the address of the public resolver */

  await resolverContract
    .setAddr(namehash('resolver.eth'), resolver._address)
    .send({
      from: accounts[0]
    })

  /* Resolve the resolver.eth content to a 32 byte content hash */

  await resolverContract
    .setContent(
      namehash('resolver.eth'),
      '0x736f6d65436f6e74656e74000000000000000000000000000000000000000000'
    )
    .send({
      from: accounts[0]
    })

  /* Setup a reverse for account[0] to eth tld  */

  await reverseRegistrarContract
    .setName('eth')
    .send({ from: accounts[2], gas: 1000000 })

  return {
    ensAddress: ens._address,
    reverseRegistrarAddress: reverseRegistrar._address
  }
}
