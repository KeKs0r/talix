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
    const base64 = Buffer.from(buffer).toString('base64')
    return { type, base64 }
}
