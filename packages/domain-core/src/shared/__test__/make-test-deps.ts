import { Command, GetCommandInput, GetCommandOutput } from '@chute/core'
import { MockFileStorage } from 'file-storage'

import { RuntimeDependencies } from '../../runtime-deps'

export function makeTestDependencies(
    overwrite?: Partial<RuntimeDependencies> & {
        innerRun<C extends Command>(
            command: C,
            input: GetCommandInput<C>,
            deps: RuntimeDependencies
        ): GetCommandOutput<C>
    }
): RuntimeDependencies {
    const fileStorage = new MockFileStorage()
    const generateId = () => `${Math.round(Math.random() * 99999999)}`

    const deps: any = {
        fileStorage,
        generateId,
        ...overwrite,
    }

    function run<C extends Command>(command: C, input: GetCommandInput<C>) {
        return overwrite?.innerRun
            ? overwrite.innerRun(command, input, deps)
            : command.run(input, deps)
    }
    deps.run = run

    return deps as RuntimeDependencies
}
