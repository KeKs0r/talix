import { Command, GetCommandInput, GetCommandOutput } from '@chute/core'
import { FileStorage } from 'file-storage'

export type RuntimeDependencies = {
    fileStorage: FileStorage
    generateId: () => string
    run<C extends Command>(command: C, input: GetCommandInput<C>): GetCommandOutput<C>
}
