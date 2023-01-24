import type { FileStorage } from './r2-file-storage'
export function getMockStorage(): FileStorage {
    const data: Record<string, any> = {}
    return {
        get: async (key: string) => data[key],
        put: async (key, stream) => {
            data[key] = stream
            return { key }
        },
    }
}
