export class Action<Id extends string = string, Input = any, Output = any, Context = any> {
    readonly actionId: Id
    _types?: {
        input: Input
        output: Output
    }
    handler: (input: Input, deps: Context) => Output
    deps?: Context
    constructor({
        actionId,
        handler,
    }: {
        actionId: Id
        handler: (input: Input, deps: Context) => Output
    }) {
        this.actionId = actionId
        this.handler = handler
        // this.run = this.run.bind(this)
        // this.register = this.register.bind(this)
    }
    // run(input: Input) {
    //     ok(this.deps, 'Can only call run after registering the action dependencies')
    //     return this.handler(input, this.deps)
    // }
    // register(deps: Context) {
    //     this.deps = deps
    //     return this
    // }
}
