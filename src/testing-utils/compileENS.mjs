import fs from 'fs'
import solc from 'solc'

const Registry = fs.readFileSync(
  './node_modules/@ensdomains/ens/contracts/ENSRegistry.sol',
  'utf8'
)

const ensInterface = fs.readFileSync(
  './node_modules/@ensdomains/ens/contracts/ENS.sol',
  'utf8'
)

const PublicResolver = fs.readFileSync(
  './node_modules/@ensdomains/ens/contracts/PublicResolver.sol',
  'utf8'
)

const ReverseRegistrar = fs.readFileSync(
  './node_modules/@ensdomains/ens/contracts/ReverseRegistrar.sol',
  'utf8'
)

const HashRegistrarSimplified = fs.readFileSync(
  './node_modules/@ensdomains/ens/contracts/HashRegistrarSimplified.sol',
  'utf8'
)

const Deed = fs.readFileSync(
  './node_modules/@ensdomains/ens/contracts/Deed.sol',
  'utf8'
)

let compiled = solc.compile(
  {
    sources: {
      'ENS.sol': ensInterface,
      'ENSRegistry.sol': Registry,
      'PublicResolver.sol': PublicResolver,
      'ReverseRegistrar.sol': ReverseRegistrar,
      'Deed.sol': Deed,
      'HashRegistrarSimplified.sol': HashRegistrarSimplified
    }
  },
  1
)

console.log(compiled)
fs.writeFile('./src/testing-utils/ENS.json', JSON.stringify(compiled), err => {
  if (err) throw err
  console.log('The file has been saved!')
})
