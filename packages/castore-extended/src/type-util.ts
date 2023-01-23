import type { Command, EventType } from '@castore/core'

export type GetCommandInput<Cmd> = Cmd extends Command<any, any, any, infer Input> ? Input : never
export type GetCommandOutput<Cmd> = Cmd extends Command<any, any, any, any, infer Output>
    ? Output
    : never

export type CommandHandler<Cmd extends Command> = (
    input: GetCommandInput<Cmd>
) => Promise<GetCommandOutput<Cmd>>
