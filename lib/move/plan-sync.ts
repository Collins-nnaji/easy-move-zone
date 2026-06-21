/** Prefix stored in relocation_tasks.notes to link Move app checklist items. */
export const MOVE_TASK_NOTE_PREFIX = "move:"

export function moveTaskNote(checklistKey: string): string {
  return `${MOVE_TASK_NOTE_PREFIX}${checklistKey}`
}

export function parseMoveTaskNote(notes: string | null | undefined): string | null {
  if (!notes?.startsWith(MOVE_TASK_NOTE_PREFIX)) return null
  const key = notes.slice(MOVE_TASK_NOTE_PREFIX.length).trim()
  return key.length ? key : null
}
