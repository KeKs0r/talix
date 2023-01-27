import { StorageAdapter } from '@castore/core'
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter'
import { FileStorage } from 'file-storage'

import { documentEventStore } from '../document'

import { voucherEventStore } from './voucher-eventstore'
import { createVoucherCommand } from './voucher-create-command'

type ServiceDeps = {
    storageAdapter?: StorageAdapter
    generateId: () => string
    fileStorage: FileStorage
}
export function createVoucherService(opts: ServiceDeps) {
    const { storageAdapter = new InMemoryStorageAdapter(), generateId, fileStorage } = opts || {}
    voucherEventStore.storageAdapter = storageAdapter
    documentEventStore.storageAdapter = storageAdapter

    const createVoucher = createVoucherCommand.register([voucherEventStore, documentEventStore], {
        generateId,
    })

    const service = {
        name: 'voucher',
        commands: {
            createVoucher,
        },
        stores: {
            [voucherEventStore.eventStoreId]: voucherEventStore,
        },
    } // satisfies Service // this does not work with wrangler
    return service
}
export type VoucherService = ReturnType<typeof createVoucherService>
