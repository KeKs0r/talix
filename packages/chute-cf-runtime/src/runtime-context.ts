import { BaseContext } from '@chute/core'
import { FileStorage } from 'file-storage'

import { Bindings } from './base-env.types'

export interface RuntimeContext extends BaseContext {
    fileStorage: FileStorage
    generateId: () => string
}

export interface CFRuntimeContext extends RuntimeContext, Bindings {}
