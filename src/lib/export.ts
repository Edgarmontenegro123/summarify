export interface ExportSummaryInput {
  title: string
  summary: string
  createdAt: Date
  dateLabel: string
  languageLabel: string
  languageName: string
  summaryHeading: string
  fileBaseName: string
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function exportSummaryAsText(input: ExportSummaryInput) {
  const {
    title,
    summary,
    createdAt,
    dateLabel,
    languageLabel,
    languageName,
    summaryHeading,
    fileBaseName,
  } = input

  const lines = [
    title,
    '='.repeat(title.length),
    '',
    `${dateLabel}: ${createdAt.toLocaleString()}`,
    `${languageLabel}: ${languageName}`,
    '',
    summaryHeading,
    '-'.repeat(summaryHeading.length),
    '',
    summary,
    '',
  ]

  downloadBlob(
    lines.join('\n'),
    `${fileBaseName}.txt`,
    'text/plain;charset=utf-8'
  )
}

export function exportSummaryAsMarkdown(input: ExportSummaryInput) {
  const {
    title,
    summary,
    createdAt,
    dateLabel,
    languageLabel,
    languageName,
    summaryHeading,
    fileBaseName,
  } = input

  const lines = [
    `# ${title}`,
    '',
    `- **${dateLabel}:** ${createdAt.toLocaleString()}`,
    `- **${languageLabel}:** ${languageName}`,
    '',
    `## ${summaryHeading}`,
    '',
    summary,
    '',
  ]

  downloadBlob(
    lines.join('\n'),
    `${fileBaseName}.md`,
    'text/markdown;charset=utf-8'
  )
}
