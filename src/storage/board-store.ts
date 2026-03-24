import * as SQLite from 'wa-sqlite'
import SQLiteAsyncESMFactory from 'wa-sqlite/dist/wa-sqlite-async.mjs'
import sqliteWasmUrl from 'wa-sqlite/dist/wa-sqlite-async.wasm?url'
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
import { TLEditorSnapshot } from 'tldraw'

const DATABASE_NAME = 'bkmk-tldraw'
const DATABASE_FILE = 'boards.sqlite3'
const SQLITE_OPEN_CREATE_READWRITE = 0x06

type PersistedBoard = {
  pageKey: string
  pageLabel: string
  pageUrl: string
  snapshot: TLEditorSnapshot
}

class BoardStore {
  private readonly sqlite3: SQLite.SQLiteAPI
  private readonly db: number

  constructor(sqlite3: SQLite.SQLiteAPI, db: number) {
    this.sqlite3 = sqlite3
    this.db = db
  }

  async loadBoard(pageKey: string): Promise<TLEditorSnapshot | null> {
    const result = await this.sqlite3.execWithParams(
      this.db,
      'SELECT snapshot_json FROM boards WHERE page_key = ? LIMIT 1',
      [pageKey]
    )

    if (result.rows.length === 0) {
      return null
    }

    const raw = result.rows[0]?.[0]
    if (typeof raw !== 'string') {
      return null
    }

    return JSON.parse(raw) as TLEditorSnapshot
  }

  async saveBoard(board: PersistedBoard): Promise<void> {
    await this.sqlite3.run(
      this.db,
      `
        INSERT INTO boards (page_key, page_url, page_label, snapshot_json, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(page_key) DO UPDATE SET
          page_url = excluded.page_url,
          page_label = excluded.page_label,
          snapshot_json = excluded.snapshot_json,
          updated_at = excluded.updated_at
      `,
      [
        board.pageKey,
        board.pageUrl,
        board.pageLabel,
        JSON.stringify(board.snapshot),
        Date.now()
      ]
    )
  }
}

let boardStorePromise: Promise<BoardStore> | null = null

export async function getBoardStore(): Promise<BoardStore> {
  if (!boardStorePromise) {
    boardStorePromise = createBoardStore()
  }

  return boardStorePromise
}

async function createBoardStore() {
  const module = await SQLiteAsyncESMFactory({
    locateFile: (path: string) => {
      if (path.endsWith('.wasm')) {
        return sqliteWasmUrl
      }

      return path
    }
  })

  const sqlite3 = SQLite.Factory(module)
  const vfs = new IDBBatchAtomicVFS(DATABASE_NAME)
  sqlite3.vfs_register(vfs, false)

  const db = await sqlite3.open_v2(DATABASE_FILE, SQLITE_OPEN_CREATE_READWRITE, vfs.name)

  await sqlite3.exec(
    db,
    `
      CREATE TABLE IF NOT EXISTS boards (
        page_key TEXT PRIMARY KEY,
        page_url TEXT NOT NULL,
        page_label TEXT NOT NULL,
        snapshot_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `
  )

  return new BoardStore(sqlite3, db)
}

export type { PersistedBoard }