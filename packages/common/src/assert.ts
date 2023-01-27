export function ok(check: unknown, message: string): asserts check {
    if (!check) {
        throw new Error(message)
    }
}
