const util = require('util');
const DAYS = 24 * 60 * 60;
const VALUE = 28 * DAYS + 1;

const secret = "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF";

const advanceTime = util.promisify(function(web3, delay, done) {
  return web3.currentProvider.send({
    jsonrpc: "2.0",
    "method": "evm_increaseTime",
    params: [delay]}, done)
  }
);

const mine = util.promisify(function(web3, done) {
  return web3.currentProvider.send({
    jsonrpc: "2.0",
    "method": "evm_mine",
    }, done)
  }
);

const registerName = async function(web3, account, controllerContract, name){
  console.log(`Registering ${name}`)
  let newnameAvailable = await controllerContract.available(name).call()
  var commitment = await controllerContract.makeCommitment(name, secret).call();
  await controllerContract.commit(commitment).send({from:account});
  var min_commitment_age = await controllerContract.MIN_COMMITMENT_AGE().call();
  await advanceTime(web3, parseInt(min_commitment_age));
  await mine(web3);

  await controllerContract
    .register(name, account, 28 * DAYS, secret)
    .send({from:account, value:VALUE, gas:5000000});

  // The name should be no longer available
  newnameAvailable = await controllerContract.available(name).call()
  if(newnameAvailable) throw(`Failed to register "${name}"`)
}

module.exports = async function deployENS({ web3, accounts }) {
  const { sha3 } = web3.utils
  function deploy(contractJSON, ...args) {
    const contract = new web3.eth.Contract(contractJSON.abi)
    return contract
      .deploy({
        data: contractJSON.bytecode,
        arguments: args
      })
      .send({
        from: accounts[0],
        gas: 6700000
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

  function loadContract(modName, contractName){
    return require(`@ensdomains/${modName}/build/contracts/${contractName}`)
  }
  
  const registryJSON = loadContract('ens', 'ENSRegistry')
  const resolverJSON = loadContract('resolver', 'PublicResolver')
  const oldResolverJSON = loadContract('ens-022', 'PublicResolver')
  const reverseRegistrarJSON = loadContract('ens', 'ReverseRegistrar')
  const baseRegistrarJSON = loadContract('ethregistrar', 'BaseRegistrarImplementation')
  const priceOracleJSON = loadContract('ethregistrar', 'SimplePriceOracle')
  const controllerJSON = loadContract('ethregistrar', 'ETHRegistrarController')
  const testRegistrarJSON = loadContract('ens', 'TestRegistrar')
  const hashRegistrarSimplifiedJSON = loadContract('ens', 'HashRegistrar')

  /* Deploy the main contracts  */
  const ens = await deploy(registryJSON)
  const resolver = await deploy(resolverJSON, ens._address)
  const oldResolver = await deploy(oldResolverJSON, ens._address)
  const reverseRegistrar = await deploy(
    reverseRegistrarJSON,
    ens._address,
    resolver._address
  )

  const testRegistrar = await deploy(
    testRegistrarJSON,
    ens._address,
    namehash('test')
  )
  // Disabled for now as the deploy was throwing error and this is not in use.
  const ethRegistrar = await deploy(
    hashRegistrarSimplifiedJSON,
    ens._address,
    namehash('eth'),
    1493895600
  )

  const ensContract = ens.methods
  const resolverContract = resolver.methods
  const oldResolverContract = oldResolver.methods
  const reverseRegistrarContract = reverseRegistrar.methods
  const testRegistrarContract = testRegistrar.methods

  console.log('ENS registry deployed at: ', ens._address)
  console.log('Public resolver deployed at: ', resolver._address)
  console.log('Old Public resolver deployed at: ', oldResolver._address)
  console.log('Reverse Registrar deployed at: ', reverseRegistrar._address)
  console.log('Test Registrar deployed at: ', testRegistrar._address)
  console.log('Auction Registrar deployed at: ', ethRegistrar._address)

  const tld = 'eth'
  const tldHash = sha3(tld)

  /* Setup the root TLD */
  await ensContract
    .setSubnodeOwner('0x00000000000000000000000000000000', tldHash, accounts[0])
    .send({
      from: accounts[0]
    })

  await ensContract
    .setSubnodeOwner('0x00000000000000000000000000000000', sha3('test'), accounts[0])
    .send({
      from: accounts[0]
    })

  await ensContract.setResolver(namehash(''), resolver._address).send({from: accounts[0]})
  await ensContract.setResolver(namehash('eth'), resolver._address).send({from: accounts[0]})
  await ensContract.setResolver(namehash('test'), resolver._address).send({from: accounts[0]})

  await ensContract
    .setSubnodeOwner('0x00000000000000000000000000000000', sha3('test'), testRegistrar._address)
    .send({
      from: accounts[0]
    })

  let rootOwner = await ensContract.owner('0x00000000000000000000000000000000').call() 

  console.log('testRegistrarContract.register', namehash('example'), testRegistrar._address); 
  await testRegistrarContract.register(sha3('example'), accounts[0]).send({from:accounts[0]})

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

    await ensContract
    .setSubnodeOwner(
      namehash('reverse'),
      sha3('addr'),
      accounts[0]
    )
    .send({
      from: accounts[0]
    })

  await ensContract.setResolver(namehash('addr.reverse'), resolver._address).send({from: accounts[0]})
  
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


  /* Set the old hash registrar contract as the owner of .eth */
  await ensContract
    .setSubnodeOwner('0x00000000000000000000000000000000', tldHash, ethRegistrar._address)
    .send({
      from: accounts[0]
    })
  
  const now = (await web3.eth.getBlock('latest')).timestamp;  
  const priceOracle = await deploy(priceOracleJSON, 1)
  const baseRegistrar = await deploy(baseRegistrarJSON, ens._address, namehash('eth'), now + 365 * DAYS)
  const controller = await deploy(controllerJSON, baseRegistrar._address, priceOracle._address)
  const baseRegistrarContract = baseRegistrar.methods
  const controllerContract = controller.methods

  console.log('Price oracle deployed at: ', priceOracle._address)
  console.log('Base registrar deployed at: ', baseRegistrar._address)
  console.log('Controller deployed at: ', controller._address)

  /* Set the pernament registrar contract as the owner of .eth */
  await ensContract
    .setSubnodeOwner('0x00000000000000000000000000000000', tldHash, baseRegistrar._address)
    .send({
      from: accounts[0]
    })
  console.log('Add controller to base registrar')
  await baseRegistrarContract.addController(controller._address).send({from: accounts[0]});

  console.log('Register name')  
  await registerName(web3, accounts[0], controllerContract, 'newname');
  await registerName(web3, accounts[0], controllerContract, 'resolver');
  await registerName(web3, accounts[0], controllerContract, 'oldresolver');
  await registerName(web3, accounts[0], controllerContract, 'awesome');
  await registerName(web3, accounts[0], controllerContract, 'superawesome');
  await registerName(web3, accounts[0], controllerContract, 'notsoawesome');
  await registerName(web3, accounts[0], controllerContract, 'abittooawesome');
  await registerName(web3, accounts[0], controllerContract, 'subdomaindummy');
  await registerName(web3, accounts[0], controllerContract, 'subdomain');

  await ensContract
    .setResolver(namehash('notsoawesome.eth'), resolver._address)
    .send({
      from: accounts[0]
    })

  /* Setup domain with a resolver and addr/content */
  console.log('Setting up abittooawesome.eth')
  const aBitTooAwesome = namehash('abittooawesome.eth')

  await ensContract.setResolver(aBitTooAwesome, resolver._address).send({
    from: accounts[0]
  })
  await resolverContract.setAddr(aBitTooAwesome, resolver._address).send({
    from: accounts[0]
  })

  await reverseRegistrarContract
    .setName('abittooawesome.eth')
    .send({ from: accounts[0], gas: 1000000 })

  await resolverContract
    .setContenthash(
      aBitTooAwesome,
      '0x736f6d65436f6e74656e74000000000000000000000000000000000000000001'
    )
    .send({
      from: accounts[0]
    })

  /* Setup some domains for subdomain testing */
  console.log('Setting up subdomaindummy.eth')

  await ensContract
    .setSubnodeOwner(
      namehash('subdomaindummy.eth'),
      sha3('original'),
      accounts[0]
    )
    .send({
      from: accounts[0]
    })

  /* Point the resolver.eth's resolver to the public resolver */
  console.log('Setting up resolvers')
  await ensContract
    .setResolver(namehash('resolver.eth'), resolver._address)
    .send({
      from: accounts[0]
    })
  await ensContract
    .setResolver(namehash('oldresolver.eth'), oldResolver._address)
    .send({
      from: accounts[0]
    })

  /* Resolve the resolver.eth address to the address of the public resolver */
  await resolverContract
    .setAddr(namehash('resolver.eth'), resolver._address)
    .send({
      from: accounts[0]
    })
  /* Resolve the oldresolver.eth address to the address of the public resolver */

  await resolverContract
    .setAddr(namehash('oldresolver.eth'), oldResolver._address)
    .send({
      from: accounts[0]
    })

  /* Resolve the resolver.eth content to a 32 byte content hash */
  console.log('Setting up contenthash')

  await resolverContract
    .setContenthash(
      namehash('resolver.eth'),
      // ipfs://QmTeW79w7QQ6Npa3b1d5tANreCDxF2iDaAPsDvW6KtLmfB
      '0xe301017012204edd2984eeaf3ddf50bac238ec95c5713fb40b5e428b508fdbe55d3b9f155ffe'
    )
    .send({
      from: accounts[0], gas:5000000
    })

  await oldResolverContract
    .setContent(
      namehash('oldresolver.eth'),
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
    emptyAddress:'0x0000000000000000000000000000000000000000',
    ensAddress: ens._address,
    ownerAddress: accounts[0],
    resolverAddress: resolver._address,
    reverseRegistrarAddress: reverseRegistrar._address,
    reverseRegistrarOwnerAddress: accounts[0]
  }
}
