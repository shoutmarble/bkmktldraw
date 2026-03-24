declare module 'wa-sqlite/dist/wa-sqlite-async.mjs' {
  type ModuleOptions = {
    locateFile?: (path: string, prefix?: string) => string
  }

  export default function SQLiteAsyncESMFactory(options?: ModuleOptions): Promise<unknown>
}

declare module 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js' {
  export class IDBBatchAtomicVFS {
    constructor(
      idbDatabaseName?: string,
      options?: {
        durability?: 'default' | 'strict' | 'relaxed'
        purge?: 'deferred' | 'manual'
        purgeAtLeast?: number
      }
    )

    name: string
    close(): Promise<void>
  }
}

declare module '*.wasm?url' {
  const url: string
  export default url
}