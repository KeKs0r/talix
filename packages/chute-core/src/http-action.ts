import { Action } from './action'

export class HttpAction<
    Id extends string = string,
    Input = any,
    Output = any,
    Context = any,
    Path extends string = string
> extends Action<Id, Input, Output, Context> {
    readonly httpPath: Path
    constructor({
        actionId,
        handler,
        httpPath,
    }: {
        actionId: Id
        handler: (input: Input, deps: Context) => Output
        httpPath: Path
    }) {
        super({ actionId, handler })
        this.httpPath = httpPath
    }
}

export function isHttpAction(action: any): action is HttpAction {
    return Boolean((action as HttpAction).httpPath)
}
