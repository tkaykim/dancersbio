/**
 * Generate URL-safe slug from stage name (e.g. "Bada Lee" -> "bada-lee")
 */
export function slugFromStageName(stageName: string): string {
  return stageName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'dancer'
}
