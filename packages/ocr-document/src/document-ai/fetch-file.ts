import { Blob } from '@cloudflare/workers-types'
import pRetry from 'p-retry'

export function fetchFile(url: string) {
    return pRetry(async () => {
        const res = await fetch(url)
        const buffer = await res.arrayBuffer()
        const base64 = arrayBufferToBase64(buffer)
        const type = res.headers.get('content-type') || res.headers.get('Content-Type')
        return { base64, type }
    })
}

export function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
    let binary = ''
    const bytes = new Uint8Array(arrayBuffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}
