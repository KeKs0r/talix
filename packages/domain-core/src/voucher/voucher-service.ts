import { StorageAdapter } from '@castore/core'
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter'
import { FileStorage } from 'cf-r2-file-storage'
import { ulid } from 'ulid'
import { Service } from 'castore-extended'

import { documentEventStore } from '../document'

import { voucherEventStore } from './voucher-eventstore'
import { createVoucherCommand } from './voucher-create-command'

type ServiceDeps = {
    storageAdapter?: StorageAdapter
    generateId: () => string
    fileStorage: FileStorage
}
export function createVoucherService(opts: ServiceDeps) {
    const {
        storageAdapter = new InMemoryStorageAdapter(),
        generateId = ulid,
        fileStorage,
    } = opts || {}
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
    } satisfies Service
    return service
}
export type VoucherService = ReturnType<typeof createVoucherService>
