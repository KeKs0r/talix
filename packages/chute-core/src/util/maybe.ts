import ok from 'tiny-invariant'
export type SuccessResponse<Data> = {
    type: 'success'
    data: Data
}

export type ErrorResponse<Err extends { message: string }> = {
    type: 'error'
    error: Err
}

export type WarningResponse<Warn extends { message: string }> = {
    type: 'warning'
    warning: Warn
}

type BaseMessage = { message: string } | undefined | unknown
type PotentialMessage<Err extends BaseMessage> = Err extends { message: string } ? Err : never
type PotentialErrorResponse<Err extends BaseMessage> = ErrorResponse<PotentialMessage<Err>>
type PotentialWarningResponse<Warn extends BaseMessage> = WarningResponse<PotentialMessage<Warn>>

export type Maybe<
    Success,
    Err extends BaseMessage = undefined,
    Warn extends BaseMessage = undefined
> = SuccessResponse<Success> | PotentialErrorResponse<Err> | PotentialWarningResponse<Warn>

export function parse<Success>(m: Maybe<Success, unknown, unknown>): Success {
    ok(m.type === 'success', `Expected Response to be success`)
    return m.data
}

export function error<Err extends { message: string }>(err: Err): ErrorResponse<Err> {
    return {
        type: 'error',
        error: err,
    }
}

export function success<Data>(data: Data): SuccessResponse<Data> {
    return {
        type: 'success',
        data,
    }
}

export function warning<Warn extends { message: string }>(warn: Warn): WarningResponse<Warn> {
    return {
        type: 'warning',
        warning: warn,
    }
}
