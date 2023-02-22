import { BaseContext } from '@chute/core'
import { FileStorage } from 'file-storage'

export interface RuntimeContext extends BaseContext {
    fileStorage: FileStorage
    generateId: () => string
}
