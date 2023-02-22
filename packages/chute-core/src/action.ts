import { $Contravariant } from '@castore/core'

import { BaseContext } from './base-context'

export type GetActionInput<A> = A extends Action<any, infer Input> ? Input : never
export type GetActionOutput<A> = A extends Action<any, any, infer Output> ? Output : never
export type GetActiontContext<A> = A extends Action<any, any, any, infer Context> ? Context : never

export class Action<
    Id extends string = string,
    Input = any,
    Output = any,
    Context extends BaseContext = BaseContext,
    $C = $Contravariant<Context, BaseContext>
> {
    readonly actionId: Id
    _types?: {
        input: Input
        output: Output
    }
    handler: (input: Input, deps: $C) => Output
    deps?: Context
    constructor({
        actionId,
        handler,
    }: {
        actionId: Id
        handler: (input: Input, deps: $C) => Output
    }) {
        this.actionId = actionId
        this.handler = handler
    }
}
