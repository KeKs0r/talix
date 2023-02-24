import pRetry from 'p-retry'

export function fetchFile(url: string) {
    return pRetry(async () => {
        const res = await fetch(url)
        const { base64, type } = await parseResponse(res)
        return { base64, type }
    })
}

interface PartialBlob {
    type: string
    arrayBuffer(): Promise<ArrayBuffer>
}

export async function parseResponse(blob: PartialBlob) {
    const type = blob.type
    const buffer = await blob.arrayBuffer()
    const base64 = arrayBufferToBase64(buffer)
    return { type, base64 }
}

function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
    let binary = ''
    const bytes = new Uint8Array(arrayBuffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}
