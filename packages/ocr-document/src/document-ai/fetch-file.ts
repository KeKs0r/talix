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

export async function parseResponse(res: { blob(): Promise<PartialBlob> }) {
    const b = await res.blob()

    const type = b.type
    const buffer = await b.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return { type, base64 }
}
