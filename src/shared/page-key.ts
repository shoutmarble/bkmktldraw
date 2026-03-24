export function getPageKey(rawUrl: string): string {
  const url = new URL(rawUrl)
  url.hash = ''
  return url.toString()
}

export function getPageLabel(rawUrl: string): string {
  const url = new URL(rawUrl)
  return `${url.hostname}${url.pathname}`
}