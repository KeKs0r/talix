import { Chute } from '@chute/core'
import { documentService, voucherService } from 'domain-core'

const chute = new Chute()
chute.registerPlugin(documentService)
chute.registerPlugin(voucherService)

export { chute }
