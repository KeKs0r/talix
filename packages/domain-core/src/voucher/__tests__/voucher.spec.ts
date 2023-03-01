import { describe, beforeEach, it, expect } from 'vitest'
import { mockEventStore } from '@chute/core'
import { random } from 'lodash-es'

import { createDocumentEventStore, documentCreatedEventType } from '../../document'
import { createVoucherEventStore } from '../voucher-eventstore'
import { createVoucherCommand, CreateVoucherInput } from '../crud/voucher-create-command'
import { createDateString } from '../../shared/date.types'
import { makeTestDependencies } from '../../shared/__test__/make-test-deps'

describe.concurrent('Voucher', () => {
    const container = makeTestDependencies()
    const voucherEventStore = createVoucherEventStore(container.cradle)
    const documentStore = createDocumentEventStore(container.cradle)
    const mockedVoucherEventStore = mockEventStore(voucherEventStore, [])
    const mockedDocumentEventStore = mockEventStore(documentStore, [
        {
            type: documentCreatedEventType.type,
            aggregateId: 'i-exist',
            payload: { name: 'i-exist.pdf', key: 'mock/12345-i-exist.pdf' },
        },
    ])

    beforeEach(() => {
        mockedDocumentEventStore.reset()
    })

    const createVoucher = (input: CreateVoucherInput) =>
        createVoucherCommand.run(input, {
            generateId: () => 'voucherId',
            documentStore: mockedDocumentEventStore,
            voucherStore: mockedVoucherEventStore,
        })

    it('Create Voucher for existing document', async () => {
        const documentHash = random(100000, 999999).toString()
        const { voucherId } = await createVoucher({
            documentId: 'i-exist',
            creditOrDebit: 'DEBIT',
            vatTaxType: 'EU',
            voucherDate: createDateString(2023, 1, 15),
            documentHash,
        })

        const { events } = await mockedVoucherEventStore.getEvents(voucherId)

        expect(events).toHaveLength(1)
        const [e] = events
        expect(e).toMatchObject({
            aggregateId: 'voucherId',
            version: 1,
            type: 'voucher:voucher_created',
            payload: { documentId: 'i-exist', documentHash },
        })

        const { aggregate } = await mockedVoucherEventStore.getExistingAggregate(voucherId)

        expect(aggregate).toMatchObject({
            aggregateId: 'voucherId',
            version: 1,
            status: 'DRAFT',
            documentId: 'i-exist',
            documentHash,
            items: [],
        })
        expect(aggregate.createdAt).toBeTruthy()
    })

    it('Create Voucher from non existing Document fails', async () => {
        expect(
            createVoucher({
                documentId: 'dont-exist',
                creditOrDebit: 'DEBIT',
                vatTaxType: 'EU',
                voucherDate: createDateString(2023, 1, 15),
                documentHash: random(100000, 999999).toString(),
            })
        ).rejects.toThrow('Unable to find aggregate dont-exist in event store documentStore.')
    })
})
