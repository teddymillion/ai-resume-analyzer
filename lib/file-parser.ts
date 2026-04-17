/**
 * Local file parser — extracts plain text from PDF and DOCX files.
 * Runs entirely on the server with no external API calls.
 *
 * PDF  → pdfreader  (pure JS, works on any Node version)
 * DOCX → mammoth
 */

// ─── PDF ──────────────────────────────────────────────────────────────────────

async function extractPdfText(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PdfReader } = require('pdfreader') as {
    PdfReader: new () => {
      parseBuffer(
        buf: Buffer,
        cb: (err: Error | null, item: PdfItem | null) => void,
      ): void
    }
  }

  type PdfItem = {
    text?: string
    y?: number
    page?: number
  }

  return new Promise((resolve, reject) => {
    const lines: Map<string, string[]> = new Map()
    let currentPage = 0

    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(new Error(`PDF parse error: ${err.message}`))
        return
      }

      // item === null means end of file
      if (!item) {
        // Flatten all collected lines into a single string
        const text = Array.from(lines.values())
          .map((words) => words.join(' '))
          .join('\n')
        resolve(text)
        return
      }

      if (item.page) {
        currentPage = item.page
      }

      if (item.text) {
        // Use page+y as a line key to group words on the same line
        const lineKey = `${currentPage}-${(item.y ?? 0).toFixed(2)}`
        const existing = lines.get(lineKey) ?? []
        existing.push(item.text)
        lines.set(lineKey, existing)
      }
    })
  })
}

// ─── DOCX ─────────────────────────────────────────────────────────────────────

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value ?? ''
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Extracts plain text from a PDF or DOCX buffer.
 * Throws if the file type is unsupported or extraction fails.
 */
export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
): Promise<string> {
  const lower = fileName.toLowerCase()

  if (lower.endsWith('.pdf')) return extractPdfText(buffer)
  if (lower.endsWith('.docx')) return extractDocxText(buffer)

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.')
}
