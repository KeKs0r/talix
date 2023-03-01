import ok from 'tiny-invariant'
export type SuccessResponse<Data> = {
    success: true
    data: Data
}

export type ErrorResponse<Err> = {
    success: false
    error: Err
}

export type Maybe<Success, Err> = SuccessResponse<Success> | ErrorResponse<Err>

export function parse<Success>(m: Maybe<Success, unknown>): Success {
    ok(m.success, `Expected Response to be success`)
    return m.data
}

export function error<Err>(err: Err): ErrorResponse<Err> {
    return {
        success: false,
        error: err,
    }
}

export function success<Data>(data: Data): SuccessResponse<Data> {
    return {
        success: true,
        data,
    }
}
