import {
  networkIdReactive,
  networkReactive,
  clientReactive,
  web3Reactive,
  reverseRecordReactive,
  accountsReactive,
  isReadOnlyReactive,
  isRunningAsSafeAppReactive,
  detailedNodeReactive,
  isENSReady,
  favouritesReactive,
  globalErrorReactive
} from './reactiveVars'
import { hasValidReverseRecord } from '../utils/utils'

export default {
  Query: {
    fields: {
      networkId: {
        read() {
          return networkIdReactive()
        }
      },
      network: {
        read() {
          const network = networkReactive()
          const networkName = network?.name
          if (!networkName) return 'Loading'
          return networkName === 'homestead' ? 'Main' : networkName
        }
      },
      accounts: {
        read() {
          return accountsReactive()
        }
      },
      displayName: {
        read(
          _,
          {
            args: { address }
          }
        ) {
          if (!address) return ''
          return hasValidReverseRecord(reverseRecordReactive())
            ? reverseRecordReactive().name
            : `${address?.slice(0, 10)}...`
        }
      },
      avatar: {
        read() {
          return reverseRecordReactive()?.avatar || ''
        }
      },
      isReadOnly: {
        read() {
          return isReadOnlyReactive()
        }
      },
      isSafeApp: {
        read() {
          return isRunningAsSafeAppReactive()
        }
      },
      singleName: {
        read() {
          return detailedNodeReactive()
        }
      },
      isENSReady: {
        read() {
          return isENSReady()
        }
      },
      favourites: {
        read() {
          return favouritesReactive()
        }
      },
      globalError: {
        read() {
          return globalErrorReactive() || false
        }
      }
    }
  }
}
