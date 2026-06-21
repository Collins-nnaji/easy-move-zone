/** Shared SQL statement splitter for setup/seed scripts. */
export function splitSqlStatements(input) {
  const statements = []
  let buf = ""
  let i = 0
  let inSingle = false
  let inDouble = false
  let inLineComment = false
  let inBlockComment = false
  let dollarTag = null

  while (i < input.length) {
    const ch = input[i]
    const next = input[i + 1]

    if (inLineComment) {
      buf += ch
      if (ch === "\n") inLineComment = false
      i += 1
      continue
    }

    if (inBlockComment) {
      buf += ch
      if (ch === "*" && next === "/") {
        buf += next
        i += 2
        inBlockComment = false
      } else {
        i += 1
      }
      continue
    }

    if (dollarTag) {
      if (input.startsWith(dollarTag, i)) {
        buf += dollarTag
        i += dollarTag.length
        dollarTag = null
      } else {
        buf += ch
        i += 1
      }
      continue
    }

    if (inSingle) {
      buf += ch
      if (ch === "'") {
        if (next === "'") {
          buf += next
          i += 2
          continue
        }
        inSingle = false
      }
      i += 1
      continue
    }

    if (inDouble) {
      buf += ch
      if (ch === '"') inDouble = false
      i += 1
      continue
    }

    if (ch === "-" && next === "-") {
      buf += ch + next
      i += 2
      inLineComment = true
      continue
    }

    if (ch === "/" && next === "*") {
      buf += ch + next
      i += 2
      inBlockComment = true
      continue
    }

    if (ch === "'") {
      inSingle = true
      buf += ch
      i += 1
      continue
    }

    if (ch === '"') {
      inDouble = true
      buf += ch
      i += 1
      continue
    }

    if (ch === "$") {
      const rest = input.slice(i)
      const match = rest.match(/^\$[A-Za-z_0-9]*\$/)
      if (match) {
        dollarTag = match[0]
        buf += dollarTag
        i += dollarTag.length
        continue
      }
    }

    if (ch === ";") {
      const stmt = buf.trim()
      if (stmt) statements.push(stmt)
      buf = ""
      i += 1
      continue
    }

    buf += ch
    i += 1
  }

  const tail = buf.trim()
  if (tail) statements.push(tail)

  return statements
}
