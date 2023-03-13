import { $Contravariant } from '@castore/core'

import { Action } from './action'
import { BaseContext } from './base-context'

export class HttpAction<
    Id extends string = string,
    Input = any,
    Output = any,
    Context extends BaseContext = BaseContext,
    Path extends string = string,
    $C = $Contravariant<Context, BaseContext>
> extends Action<Id, Input, Output, Context, $C> {
    readonly httpPath: Path
    readonly httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    constructor({
        actionId,
        handler,
        httpPath,
        httpMethod = 'POST',
    }: {
        actionId: Id
        handler: (input: Input, deps: $C) => Output
        httpPath: Path
        httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    }) {
        super({ actionId, handler })
        this.httpPath = httpPath
        this.httpMethod = httpMethod
    }
}

export function isHttpAction(action: any): action is HttpAction {
    return Boolean((action as HttpAction).httpPath)
}
