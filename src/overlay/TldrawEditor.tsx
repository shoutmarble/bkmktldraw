import { useEffect, useState } from 'react'
import { Editor, TLEditorSnapshot, Tldraw, getSnapshot } from 'tldraw'
import { getBoardStore } from '../storage/board-store'

type PageContext = {
  pageKey: string
  pageLabel: string
  pageUrl: string
}

type TldrawEditorProps = {
  pageContext: PageContext
  snapshot: TLEditorSnapshot | null
}

export default function TldrawEditor({ pageContext, snapshot }: TldrawEditorProps) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [editor, setEditor] = useState<Editor | null>(null)

  useEffect(() => {
    if (!editor) {
      return
    }

    let saveTimer = 0
    let resetTimer = 0

    const unsubscribe = editor.store.listen(() => {
      window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(() => {
        void (async () => {
          try {
            setSaveState('saving')
            const boardStore = await getBoardStore()
            await boardStore.saveBoard({
              pageKey: pageContext.pageKey,
              pageLabel: pageContext.pageLabel,
              pageUrl: pageContext.pageUrl,
              snapshot: getSnapshot(editor.store)
            })

            setSaveState('saved')
            window.clearTimeout(resetTimer)
            resetTimer = window.setTimeout(() => setSaveState('idle'), 1200)
          } catch (error) {
            console.error('Failed to save TLDraw snapshot', error)
            setSaveState('error')
          }
        })()
      }, 500)
    })

    return () => {
      window.clearTimeout(saveTimer)
      window.clearTimeout(resetTimer)
      unsubscribe()
    }
  }, [editor, pageContext.pageKey, pageContext.pageLabel, pageContext.pageUrl])

  const statusLabel =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'saved'
        ? 'Saved'
        : saveState === 'error'
          ? 'Save failed'
          : `Persisted board for ${pageContext.pageLabel}`

  return (
    <div className="overlay-shell">
      <div className="overlay-banner">{statusLabel}</div>
      <div className="overlay-canvas">
        <Tldraw
          snapshot={snapshot ?? undefined}
          onMount={(editor) => {
            setEditor(editor)
          }}
        />
      </div>
    </div>
  )
}