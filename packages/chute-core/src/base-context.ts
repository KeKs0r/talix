import { Action } from './action'
import { Command, GetCommandInput, GetCommandOutput } from './command'

export type BaseContext = {
    /**
     * @TODO: GetCommandOutput does not return a type of promise even if the handler is async
     */
    runCommand<C extends Command>(
        command: C,
        input: GetCommandInput<C>
    ): Promise<GetCommandOutput<C>>
    runAction<
        Id extends string = string,
        Input = any,
        Output = any,
        Context extends BaseContext = BaseContext
    >(
        action: Action<Id, Input, Output, Context>,
        input: Input
    ): Promise<Output>
    parent?: Command | Action
}
