import type { ExecutionContext } from '@cloudflare/workers-types'
import type { BaseContext } from '@chute/core'
import type { FileStorage } from 'file-storage'
import type Emittery from 'emittery'
import type { StorageAdapter } from '@castore/core'

import { Bindings } from './base-env.types'

export interface RuntimeContext extends BaseContext {
    emitter: Emittery
    fileStorage: FileStorage
    generateId: () => string
    execCtx: ExecutionContext
    storageAdapter: StorageAdapter
}

export interface CFRuntimeContext extends RuntimeContext, Bindings {}
