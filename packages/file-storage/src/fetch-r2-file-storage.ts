import { AwsClient } from 'aws4fetch'

export type FileStorage = {
    put: (key: string, value: NodeJS.ReadableStream | string | Blob) => Promise<{ key: string }>
    get: (key: string) => Promise<Blob | null>
}

type R2FileClientDeps = {
    accessKeyId: string
    secretAccessKey: string
    accountId: string
    bucketName: string
}

export function createFileStorage({
    accessKeyId,
    accountId,
    secretAccessKey,
    bucketName,
}: R2FileClientDeps) {
    const client = new AwsClient({
        accessKeyId,
        secretAccessKey,
    })
    const R2_URL = `https://${accountId}.r2.cloudflarestorage.com`
    return {
        put: async (
            key: string,
            value: NodeJS.ReadableStream | string | Blob,
            meta?: { contentType?: string }
        ) => {
            //https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html
            const contentType = value instanceof Blob ? value.type : meta?.contentType
            const file = await client.fetch(`${R2_URL}/${bucketName}/${key}`, {
                method: 'PUT',
                body: value,
                headers: {
                    'Content-Type': contentType,
                },
            })
            const r = await file.text()
            console.log('fetch-r2-file-storage', r)
            return {
                key,
            }
        },
        get: async (key: string): Promise<Blob> => {
            const resp = await client.fetch(`${R2_URL}/${bucketName}/${key}`)
            return resp.blob() as Blob
        },
    }
}
