import { ExecutionContext } from '@cloudflare/workers-types'
import { BaseContext } from '@chute/core'
import { FileStorage } from 'file-storage'

import { Bindings } from './base-env.types'

export interface RuntimeContext extends BaseContext {
    fileStorage: FileStorage
    generateId: () => string
    execCtx: ExecutionContext
}

export interface CFRuntimeContext extends RuntimeContext, Bindings {}
