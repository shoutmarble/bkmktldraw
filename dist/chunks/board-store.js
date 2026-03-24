import{M as n,s as l,F as i,I as d}from"./vendor-storage.js";const c="bkmk-tldraw",p="boards.sqlite3",u=6;class E{sqlite3;db;constructor(e,a){this.sqlite3=e,this.db=a}async loadBoard(e){const a=await this.sqlite3.execWithParams(this.db,"SELECT snapshot_json FROM boards WHERE page_key = ? LIMIT 1",[e]);if(a.rows.length===0)return null;const t=a.rows[0]?.[0];return typeof t!="string"?null:JSON.parse(t)}async saveBoard(e){await this.sqlite3.run(this.db,`
        INSERT INTO boards (page_key, page_url, page_label, snapshot_json, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(page_key) DO UPDATE SET
          page_url = excluded.page_url,
          page_label = excluded.page_label,
          snapshot_json = excluded.snapshot_json,
          updated_at = excluded.updated_at
      `,[e.pageKey,e.pageUrl,e.pageLabel,JSON.stringify(e.snapshot),Date.now()])}}let s=null;async function g(){return s||(s=T()),s}async function T(){const r=await n({locateFile:o=>o.endsWith(".wasm")?l:o}),e=i(r),a=new d(c);e.vfs_register(a,!1);const t=await e.open_v2(p,u,a.name);return await e.exec(t,`
      CREATE TABLE IF NOT EXISTS boards (
        page_key TEXT PRIMARY KEY,
        page_url TEXT NOT NULL,
        page_label TEXT NOT NULL,
        snapshot_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `),new E(e,t)}export{g as getBoardStore};
