import { FileStorage } from './file-storage'

export class MockFileStorage extends FileStorage {
    data: Record<string, any> = {}
    async get(key: string) {
        return this.data[key]
    }
    async put(key: string, stream: any) {
        this.data[key] = stream
        return { key }
    }
}
