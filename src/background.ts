const TOGGLE_MESSAGE = { type: 'BKMK_TLDRAW_TOGGLE' } as const

function isSupportedTabUrl(url?: string) {
  if (!url) {
    return false
  }

  return /^(https?|file):/i.test(url)
}

async function ensureContentScript(tabId: number) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'BKMK_TLDRAW_PING' })
    return
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    })
  }
}

async function showUnsupportedBadge(tabId: number) {
  await chrome.action.setBadgeBackgroundColor({ color: '#b91c1c', tabId })
  await chrome.action.setBadgeText({ text: 'NO', tabId })
  await chrome.action.setTitle({
    title: 'TLDraw overlay is only available on normal web pages and file URLs.',
    tabId
  })
}

async function clearBadge(tabId: number) {
  await chrome.action.setBadgeText({ text: '', tabId })
  await chrome.action.setTitle({
    title: 'Toggle TLDraw overlay',
    tabId
  })
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    return
  }

  if (!isSupportedTabUrl(tab.url)) {
    await showUnsupportedBadge(tab.id)
    return
  }

  try {
    await ensureContentScript(tab.id)
    await clearBadge(tab.id)
    await chrome.tabs.sendMessage(tab.id, TOGGLE_MESSAGE)
  } catch (error) {
    console.error('Failed to toggle tldraw overlay', error)
    await chrome.action.setBadgeBackgroundColor({ color: '#b91c1c', tabId: tab.id })
    await chrome.action.setBadgeText({ text: 'ERR', tabId: tab.id })
  }
})