declare global {
    export const { fetch, FormData, Headers, Request, Response }: typeof import('undici')
    export type { FormData, Headers, Request, RequestInit, Response } from 'undici'
}

export {}
