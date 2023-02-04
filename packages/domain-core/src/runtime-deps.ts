import { Command, GetCommandInput, GetCommandOutput } from 'castore-extended'
import { FileStorage } from 'file-storage'

export type RuntimeDependencies = {
    fileStorage: FileStorage
    generateId: () => string
    run<C extends Command>(command: C, input: GetCommandInput<C>): GetCommandOutput<C>
}
