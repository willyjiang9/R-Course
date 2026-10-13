const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'vs', 'via', 'with'])

export function displayTitle(raw) {
  if (!raw) return ''
  const decoded = String(raw)
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
  const words = decoded.toLowerCase().split(/(\s+|[-:/])/)
  return words
    .map((word, i) => {
      if (!/[a-z]/.test(word)) return word
      if (i !== 0 && SMALL.has(word)) return word
      return word.replace(/^[a-z]/, c => c.toUpperCase())
    })
    .join('')
}

export function formatCount(n) {
  return new Intl.NumberFormat('en-US').format(n)
}
