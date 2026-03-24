import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import type { TLEditorSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; snapshot: TLEditorSnapshot | null }
  | { status: 'error'; message: string }

const TldrawEditor = lazy(() => import('./TldrawEditor'))

function readPageContext() {
  const params = new URLSearchParams(window.location.search)

  return {
    pageKey: params.get('pageKey') ?? window.location.href,
    pageLabel: params.get('pageLabel') ?? 'Current page',
    pageUrl: params.get('pageUrl') ?? window.location.href
  }
}

export function OverlayApp() {
  const pageContext = useMemo(readPageContext, [])
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const { getBoardStore } = await import('../storage/board-store')
        const boardStore = await getBoardStore()
        const snapshot = await boardStore.loadBoard(pageContext.pageKey)

        if (!cancelled) {
          setLoadState({ status: 'ready', snapshot })
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Failed to load board'
          setLoadState({ status: 'error', message })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pageContext.pageKey])

  if (loadState.status === 'loading') {
    return (
      <div className="overlay-shell overlay-shell-loading">
        <div className="overlay-banner">Loading board for {pageContext.pageLabel}</div>
        <div className="overlay-status">Preparing local SQLite board storage…</div>
      </div>
    )
  }

  if (loadState.status === 'error') {
    return (
      <div className="overlay-shell overlay-shell-loading">
        <div className="overlay-banner">Board load failed</div>
        <div className="overlay-status overlay-status-error">{loadState.message}</div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="overlay-shell overlay-shell-loading">
          <div className="overlay-banner">Loading editor for {pageContext.pageLabel}</div>
          <div className="overlay-status">Preparing TLDraw runtime…</div>
        </div>
      }
    >
      <TldrawEditor pageContext={pageContext} snapshot={loadState.snapshot} />
    </Suspense>
  )
}