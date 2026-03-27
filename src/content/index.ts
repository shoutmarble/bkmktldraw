import { getPageKey, getPageLabel } from '../shared/page-key'

const ROOT_ID = 'bkmk-tldraw-root'
const WRAPPER_ID = 'bkmk-tldraw-wrapper'
const TOOLBAR_HEIGHT = 36
const INIT_FLAG = '__BKMK_TLDRAW_CONTENT_SCRIPT__'

declare global {
  interface Window {
    __BKMK_TLDRAW_CONTENT_SCRIPT__?: boolean
  }
}

if (!window[INIT_FLAG]) {
  window[INIT_FLAG] = true
  initializeContentScript()
}

function initializeContentScript() {
  let dragState: {
    pointerId: number
    offsetX: number
    offsetY: number
  } | null = null

  let resizeState: {
    pointerId: number
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    startLeft: number
    edge: 'left' | 'right'
  } | null = null

  function buildOverlayUrl() {
    const params = new URLSearchParams({
      pageKey: getPageKey(window.location.href),
      pageLabel: getPageLabel(window.location.href),
      pageUrl: window.location.href
    })

    return `${chrome.runtime.getURL('overlay.html')}?${params.toString()}`
  }

  function clampPosition(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }

  function ensureOverlay() {
    const existing = document.getElementById(ROOT_ID)
    if (existing) {
      return existing
    }

    const root = document.createElement('div')
    root.id = ROOT_ID

    const shadow = root.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = `
    :host {
      all: initial;
    }

    .wrapper {
      position: fixed;
      top: 16px;
      right: 16px;
      width: max(360px, 25vw);
      height: max(260px, 25vh);
      min-width: 320px;
      min-height: 220px;
      max-width: min(90vw, 960px);
      max-height: min(90vh, 900px);
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(15, 23, 42, 0.18);
      border-radius: 14px;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.28);
      overflow: hidden;
      backdrop-filter: blur(10px);
      color: #0f172a;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }

    .toolbar {
      height: ${TOOLBAR_HEIGHT}px;
      padding: 0 10px;
      background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
      border-bottom: 1px solid rgba(15, 23, 42, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
      user-select: none;
    }

    .toolbar:active {
      cursor: grabbing;
    }

    .title {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 75%;
    }

    .close {
      border: 0;
      background: transparent;
      color: #334155;
      font-size: 18px;
      line-height: 1;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      cursor: pointer;
    }

    .close:hover {
      background: rgba(15, 23, 42, 0.08);
    }

    iframe {
      flex: 1;
      width: 100%;
      border: 0;
      background: #ffffff;
    }

    .resize {
      position: absolute;
      bottom: 0;
      width: 18px;
      height: 18px;
    }

    .resize-right {
      right: 0;
      cursor: nwse-resize;
      background:
        linear-gradient(135deg, transparent 0 50%, rgba(15, 23, 42, 0.22) 50% 60%, transparent 60% 100%),
        linear-gradient(135deg, transparent 0 68%, rgba(15, 23, 42, 0.22) 68% 78%, transparent 78% 100%);
    }

    .resize-left {
      left: 0;
      cursor: nesw-resize;
      background:
        linear-gradient(225deg, transparent 0 50%, rgba(15, 23, 42, 0.22) 50% 60%, transparent 60% 100%),
        linear-gradient(225deg, transparent 0 68%, rgba(15, 23, 42, 0.22) 68% 78%, transparent 78% 100%);
    }
    `

    const wrapper = document.createElement('div')
    wrapper.id = WRAPPER_ID
    wrapper.className = 'wrapper'

    const toolbar = document.createElement('div')
    toolbar.className = 'toolbar'

    const title = document.createElement('div')
    title.className = 'title'
    title.textContent = `TLDraw • ${getPageLabel(window.location.href)}`

    const closeButton = document.createElement('button')
    closeButton.className = 'close'
    closeButton.type = 'button'
    closeButton.textContent = '×'
    closeButton.title = 'Close overlay'
    closeButton.addEventListener('click', () => root.remove())

    toolbar.append(title, closeButton)

    const iframe = document.createElement('iframe')
    iframe.src = buildOverlayUrl()
    iframe.title = 'TLDraw overlay'
    iframe.allow = 'clipboard-read; clipboard-write'

    const leftResizeHandle = document.createElement('div')
    leftResizeHandle.className = 'resize resize-left'

    const resizeHandle = document.createElement('div')
    resizeHandle.className = 'resize resize-right'

    toolbar.addEventListener('pointerdown', (event) => {
      if (event.target === closeButton) {
        return
      }

      dragState = {
        pointerId: event.pointerId,
        offsetX: event.clientX - wrapper.getBoundingClientRect().left,
        offsetY: event.clientY - wrapper.getBoundingClientRect().top
      }
      toolbar.setPointerCapture(event.pointerId)
    })

    toolbar.addEventListener('pointermove', (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      const width = wrapper.offsetWidth
      const height = wrapper.offsetHeight
      const left = clampPosition(event.clientX - dragState.offsetX, 0, window.innerWidth - width)
      const top = clampPosition(event.clientY - dragState.offsetY, 0, window.innerHeight - height)

      wrapper.style.left = `${left}px`
      wrapper.style.top = `${top}px`
      wrapper.style.right = 'auto'
    })

    toolbar.addEventListener('pointerup', (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      dragState = null
      toolbar.releasePointerCapture(event.pointerId)
    })

    function attachResizeHandle(handle: HTMLDivElement, edge: 'left' | 'right') {
      handle.addEventListener('pointerdown', (event) => {
        const bounds = wrapper.getBoundingClientRect()

        resizeState = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startWidth: wrapper.offsetWidth,
          startHeight: wrapper.offsetHeight,
          startLeft: bounds.left,
          edge
        }
        handle.setPointerCapture(event.pointerId)
        event.stopPropagation()
      })

      handle.addEventListener('pointermove', (event) => {
        if (!resizeState || resizeState.pointerId !== event.pointerId || resizeState.edge !== edge) {
          return
        }

        const maxWidth = Math.floor(window.innerWidth * 0.9)
        const maxHeight = Math.floor(window.innerHeight * 0.9)
        const widthDelta = event.clientX - resizeState.startX
        const unclampedWidth =
          edge === 'left'
            ? resizeState.startWidth - widthDelta
            : resizeState.startWidth + widthDelta
        const nextWidth = clampPosition(unclampedWidth, 320, maxWidth)
        const nextHeight = clampPosition(
          resizeState.startHeight + (event.clientY - resizeState.startY),
          220,
          maxHeight
        )

        wrapper.style.width = `${nextWidth}px`
        wrapper.style.height = `${nextHeight}px`

        if (edge === 'left') {
          const nextLeft = clampPosition(
            resizeState.startLeft + (resizeState.startWidth - nextWidth),
            0,
            window.innerWidth - nextWidth
          )

          wrapper.style.left = `${nextLeft}px`
          wrapper.style.right = 'auto'
        }
      })

      handle.addEventListener('pointerup', (event) => {
        if (!resizeState || resizeState.pointerId !== event.pointerId || resizeState.edge !== edge) {
          return
        }

        resizeState = null
        handle.releasePointerCapture(event.pointerId)
      })
    }

    attachResizeHandle(leftResizeHandle, 'left')
    attachResizeHandle(resizeHandle, 'right')

    shadow.append(style, wrapper)
    wrapper.append(toolbar, iframe, leftResizeHandle, resizeHandle)
    document.documentElement.append(root)

    return root
  }

  function toggleOverlay() {
    const existing = document.getElementById(ROOT_ID)
    if (existing) {
      existing.remove()
      return
    }

    ensureOverlay()
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'BKMK_TLDRAW_PING') {
      return
    }

    if (message?.type === 'BKMK_TLDRAW_TOGGLE') {
      toggleOverlay()
    }
  })
}