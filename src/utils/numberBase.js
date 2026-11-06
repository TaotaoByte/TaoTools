export function convertBase(input, fromBase, toBase) {
  const patterns = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^[0-9]+$/, 16: /^[0-9a-f]+$/i }
  const raw = input.trim()
  const negative = raw.startsWith('-')
  const digits = raw.replace(/^[+-]/, '')
  if (!patterns[fromBase]?.test(digits) || !patterns[toBase]) throw new Error('请输入符合所选进制的完整整数')
  const prefixes = { 2: '0b', 8: '0o', 10: '', 16: '0x' }
  const value = BigInt(prefixes[fromBase] + digits)
  return ((negative ? -value : value).toString(toBase)).toUpperCase()
}
