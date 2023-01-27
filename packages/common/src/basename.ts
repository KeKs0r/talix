export function basename(url: string) {
    const u = new URL(url)
    const pathName = u.pathname
    const parts = pathName.split('/')
    return parts[parts.length - 1]
}
