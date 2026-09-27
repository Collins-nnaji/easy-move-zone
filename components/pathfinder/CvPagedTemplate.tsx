"use client"

import { useCallback, useLayoutEffect, useRef, useState } from "react"
import type { ClipboardEvent as ReactClipboardEvent, CSSProperties, FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react"
import { ArrowDown, ArrowUp, List, Loader2, PenLine, Plus, Trash2 } from "lucide-react"
import type { BuilderCV } from "@/lib/documents/cv-ai"
import { parseBulletText, toBulletText, toggleBullets } from "@/lib/documents/bullets"
import { SECTION_PRESETS } from "@/lib/documents/cv-sections"

type AiAction = "summary" | `experience-${number}`

export type CvBlock = { top: number; bottom: number; keepWithNext?: boolean }
export type PageGeometry = { pageHeight: number; marginTop: number; marginBottom: number; keepLine: number }

const MM = { page: 297, top: 15, bottom: 16, keepLine: 12 }

/**
 * Content flows continuously; a block that would run into a page's bottom margin gets
 * pushed to the top of the next page. Blocks are single lines of the CV (a bullet, a role
 * heading, an education row), so sections split across pages rather than moving whole.
 * Headings are kept with the first line that follows them.
 */
export function paginateBlocks(blocks: CvBlock[], geometry: PageGeometry) {
  const { pageHeight, marginTop, marginBottom, keepLine } = geometry
  const usable = pageHeight - marginTop - marginBottom
  const pushes = blocks.map(() => 0)
  let shift = 0
  let lastBottom = 0
  blocks.forEach((block, index) => {
    const top = block.top + shift
    let bottom = block.bottom + shift
    let last = index
    while (blocks[last].keepWithNext && blocks[last + 1]) last += 1
    if (last > index) bottom = Math.max(bottom, Math.min(blocks[last].bottom, blocks[last].top + keepLine) + shift)
    const page = Math.floor(top / pageHeight)
    const limit = (page + 1) * pageHeight - marginBottom
    if (bottom > limit + 0.5 && bottom - top <= usable) {
      pushes[index] = (page + 1) * pageHeight + marginTop - top
      shift += pushes[index]
    }
    lastBottom = Math.max(lastBottom, block.bottom + shift)
  })
  return { pushes, pageCount: Math.max(1, Math.ceil((lastBottom + marginBottom - 0.5) / pageHeight)) }
}

const editableClass = "rounded-sm outline-none transition hover:bg-emerald-50 focus:bg-emerald-50 focus:ring-2 focus:ring-[#2f5d50]/15 empty:before:text-slate-300 empty:before:content-[attr(data-placeholder)]"

function selectionOffsets(element: HTMLElement) {
  const selection = window.getSelection()
  const text = element.textContent || ""
  if (!selection?.rangeCount || !element.contains(selection.anchorNode)) return { start: text.length, end: text.length }
  const range = selection.getRangeAt(0)
  const probe = document.createRange()
  probe.selectNodeContents(element)
  probe.setEnd(range.startContainer, range.startOffset)
  const start = probe.toString().length
  probe.setEnd(range.endContainer, range.endOffset)
  return { start, end: probe.toString().length }
}

function placeCaret(element: HTMLElement, offset: number) {
  element.focus()
  const range = document.createRange()
  const node = element.firstChild
  if (node?.nodeType === Node.TEXT_NODE) range.setStart(node, Math.min(offset, node.textContent?.length ?? 0))
  else range.selectNodeContents(element)
  range.collapse(true)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function insertPlainText(text: string) {
  document.execCommand("insertText", false, text)
}

function Editable({ value, onChange, placeholder, className = "" }: {
  value: string; onChange: (value: string) => void; placeholder: string; className?: string
}) {
  return <span key={value} contentEditable suppressContentEditableWarning role="textbox" data-placeholder={placeholder}
    onBlur={(event) => { const text = (event.currentTarget.textContent || "").trim(); if (text !== value) onChange(text) }}
    onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur() } }}
    onPaste={(event) => { event.preventDefault(); insertPlainText(event.clipboardData.getData("text/plain").replace(/\s*\n\s*/g, " ")) }}
    className={`${editableClass} inline-block ${className}`}>{value}</span>
}

function splitLines(value: string) {
  const { lines } = parseBulletText(value)
  return lines.length ? lines : [""]
}

/**
 * Each line (a bullet, or a summary paragraph) is its own editable field and its own
 * page-break block, so a line never splits across pages and editing never spans two pages.
 */
function EditableLines({ value, onChange, placeholder, className = "", defaultBullets = false, linePlaceholder = "Achievement" }: {
  value: string; onChange: (value: string) => void; placeholder: string; className?: string; defaultBullets?: boolean; linePlaceholder?: string
}) {
  const [synced, setSynced] = useState(value)
  const [lines, setLines] = useState(() => splitLines(value))
  if (value !== synced) {
    setSynced(value)
    setLines(splitLines(value))
  }
  const parsed = parseBulletText(synced)
  const bulleted = parsed.isBulleted || (!parsed.lines.length && defaultBullets)
  const containerRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef(lines)
  const pendingFocus = useRef<{ index: number; offset: number } | null>(null)
  const restructuring = useRef(false)

  useLayoutEffect(() => {
    linesRef.current = lines
    const target = pendingFocus.current
    if (!target) return
    pendingFocus.current = null
    restructuring.current = false
    const element = containerRef.current?.querySelectorAll<HTMLElement>("[data-line]")[target.index]
    if (element) placeCaret(element, target.offset)
  }, [lines])

  function commit(next: string[], focus?: { index: number; offset: number }) {
    const kept = next.map((line) => line.trim())
    const filled = kept.filter(Boolean)
    const out = bulleted ? toBulletText(filled) : filled.join("\n")
    if (focus) { pendingFocus.current = focus; restructuring.current = true }
    setLines(kept.length ? kept : [""])
    setSynced(out)
    if (out !== value) onChange(out)
  }

  function lineElement(index: number) {
    return containerRef.current?.querySelectorAll<HTMLElement>("[data-line]")[index] ?? null
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>, index: number) {
    const element = event.currentTarget
    const text = element.textContent || ""
    const { start, end } = selectionOffsets(element)
    const current = linesRef.current
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      commit([...current.slice(0, index), text.slice(0, start), text.slice(end), ...current.slice(index + 1)], { index: index + 1, offset: 0 })
    } else if (event.key === "Backspace" && start === 0 && end === 0 && index > 0) {
      event.preventDefault()
      const previous = current[index - 1]
      commit([...current.slice(0, index - 1), previous + text, ...current.slice(index + 1)], { index: index - 1, offset: previous.length })
    } else if (event.key === "Delete" && start === text.length && end === text.length && index < current.length - 1) {
      event.preventDefault()
      commit([...current.slice(0, index), text + current[index + 1], ...current.slice(index + 2)], { index, offset: text.length })
    } else if (event.key === "ArrowUp" && start === 0 && index > 0) {
      const previous = lineElement(index - 1)
      if (previous) { event.preventDefault(); placeCaret(previous, (previous.textContent || "").length) }
    } else if (event.key === "ArrowDown" && end === text.length && index < current.length - 1) {
      const next = lineElement(index + 1)
      if (next) { event.preventDefault(); placeCaret(next, 0) }
    }
  }

  function onPaste(event: ReactClipboardEvent<HTMLDivElement>, index: number) {
    event.preventDefault()
    const pasted = event.clipboardData.getData("text/plain")
    const parts = pasted.split(/\r?\n/).map((line) => line.replace(/^\s*[-•*·▪]\s+/, "").trim()).filter(Boolean)
    if (parts.length <= 1) return insertPlainText(parts[0] ?? "")
    const element = event.currentTarget
    const text = element.textContent || ""
    const { start, end } = selectionOffsets(element)
    const current = linesRef.current
    const inserted = [text.slice(0, start) + parts[0], ...parts.slice(1, -1), parts[parts.length - 1] + text.slice(end)]
    commit([...current.slice(0, index), ...inserted, ...current.slice(index + 1)], { index: index + inserted.length - 1, offset: parts[parts.length - 1].length })
  }

  function onBlur(event: ReactFocusEvent<HTMLDivElement>, index: number) {
    if (restructuring.current || !event.currentTarget.isConnected) return
    const next = [...linesRef.current]
    next[index] = (event.currentTarget.textContent || "").trim()
    const leaving = !containerRef.current?.contains(event.relatedTarget as Node | null)
    const cleaned = leaving ? next.filter(Boolean) : next
    if (cleaned.join("\n") !== linesRef.current.join("\n")) commit(cleaned)
  }

  function addLine() {
    const current = linesRef.current
    const blank = current.findIndex((line) => !line)
    if (blank >= 0) {
      const element = lineElement(blank)
      if (element) placeCaret(element, 0)
      return
    }
    commit([...current, ""], { index: current.length, offset: 0 })
  }

  const renderLine = (line: string, index: number) => <div key={`${index}:${line}`} data-line="" contentEditable suppressContentEditableWarning role="textbox"
    data-placeholder={index === 0 ? placeholder : bulleted ? linePlaceholder : "New line"}
    onKeyDown={(event) => onKeyDown(event, index)} onPaste={(event) => onPaste(event, index)} onBlur={(event) => onBlur(event, index)}
    className={`${editableClass} block`}>{line}</div>

  return <div ref={containerRef} className={`group/lines relative ${className}`}>
    <button type="button" onClick={addLine} title={bulleted ? "Add bullet" : "Add line"} aria-label={bulleted ? "Add bullet" : "Add line"}
      className="cv-editor-control absolute bottom-0 left-full ml-2 flex h-6 w-6 items-center justify-center rounded-md border border-[#dfe7e3] bg-white text-[#2f5d50] opacity-0 shadow-sm transition hover:bg-[#eef4f1] group-hover/lines:opacity-100 group-focus-within/lines:opacity-100">
      <Plus className="h-3 w-3" />
    </button>
    {bulleted
      ? <ul className="list-disc space-y-1 pl-4 marker:text-[#2f5d50]">{lines.map((line, index) => <li key={`${index}:${line}`} data-cv-block="">{renderLine(line, index)}</li>)}</ul>
      : <div className="space-y-1.5">{lines.map((line, index) => <div key={`${index}:${line}`} data-cv-block="">{renderLine(line, index)}</div>)}</div>}
  </div>
}

function MarginTools({ children }: { children: ReactNode }) {
  return <div className="cv-editor-control absolute left-full top-0 ml-2 flex flex-col gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">{children}</div>
}

function ToolButton({ label, onClick, children, danger = false }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean }) {
  return <button type="button" onClick={onClick} title={label} aria-label={label} className={`flex h-6 w-6 items-center justify-center rounded-md border bg-white shadow-sm ${danger ? "border-rose-100 text-rose-500 hover:bg-rose-50" : "border-[#dfe7e3] text-[#2f5d50] hover:bg-[#eef4f1]"}`}>{children}</button>
}

function SectionHeading({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return <div data-cv-block="" data-cv-keep="" className="group">
    <div className="relative border-b border-[#2f5d50]/30 pb-1">
      <h2 className="text-[11px] font-black uppercase tracking-[.18em] text-[#2f5d50]">{title}</h2>
      {children && <MarginTools>{children}</MarginTools>}
    </div>
  </div>
}

export function CvPagedTemplate({ cv, onChange, busy, onAi }: {
  cv: BuilderCV
  onChange: (cv: BuilderCV) => void
  busy: string
  onAi: (action: AiAction) => void
}) {
  const sheetRef = useRef<HTMLElement>(null)
  const [pageCount, setPageCount] = useState(1)
  const patchPersonal = (key: keyof BuilderCV["personalInfo"], value: string) => onChange({ ...cv, personalInfo: { ...cv.personalInfo, [key]: value } })
  const patchExperience = (index: number, changes: Partial<BuilderCV["experience"][number]>) => onChange({ ...cv, experience: cv.experience.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item) })
  const patchEducation = (index: number, changes: Partial<BuilderCV["education"][number]>) => onChange({ ...cv, education: cv.education.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item) })
  const categories = cv.skillCategories.length ? cv.skillCategories : [{ id: "skills", name: "Skills", skills: [] }]
  const patchCategory = (index: number, changes: Partial<BuilderCV["skillCategories"][number]>) => onChange({ ...cv, skillCategories: categories.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item) })
  const patchSkills = (index: number, value: string) => patchCategory(index, { skills: value.split(/[·,;\n]/).map((skill) => skill.trim()).filter(Boolean) })
  const sections = cv.sections ?? []
  const patchSection = (index: number, changes: Partial<BuilderCV["sections"][number]>) => onChange({ ...cv, sections: sections.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item) })
  const moveSection = (index: number, step: number) => {
    const target = index + step
    if (target < 0 || target >= sections.length) return
    const next = [...sections]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange({ ...cv, sections: next })
  }
  const toggleSectionBullets = (index: number) => {
    const section = sections[index]
    if (!section.content.trim()) return patchSection(index, { bullets: !section.bullets })
    const content = toggleBullets(section.content)
    patchSection(index, { content, bullets: parseBulletText(content).isBulleted })
  }
  const addSection = (title: string, bullets: boolean) => onChange({ ...cv, sections: [...sections, { id: crypto.randomUUID(), title, content: "", bullets }] })
  const usedTitles = new Set(sections.map((section) => section.title.trim().toLowerCase()))
  const addSectionBar = <div className="flex flex-wrap items-center gap-1.5">
    <span className="mr-1 text-[11px] font-extrabold uppercase tracking-wide text-[#5c6a63]">Add a section</span>
    {SECTION_PRESETS.filter((preset) => !usedTitles.has(preset.title.toLowerCase())).map((preset) => <button key={preset.title} type="button" onClick={() => addSection(preset.title, preset.bullets)} className="inline-flex h-7 items-center gap-1 rounded-full border border-[#cfdcd5] bg-white px-2.5 text-[11px] font-bold text-[#2f5d50] hover:bg-[#eef4f1]"><Plus className="h-3 w-3" />{preset.title}</button>)}
    <button type="button" onClick={() => addSection("", true)} className="inline-flex h-7 items-center gap-1 rounded-full bg-[#2f5d50] px-2.5 text-[11px] font-bold text-white hover:bg-[#264c42]"><Plus className="h-3 w-3" />Custom section</button>
  </div>

  const paginate = useCallback(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    const blocks = Array.from(sheet.querySelectorAll<HTMLElement>("[data-cv-block]"))
    blocks.forEach((block) => { block.style.paddingTop = "" })
    const sheetRect = sheet.getBoundingClientRect()
    const px = sheetRect.width / 210
    const measured = blocks.map((block) => {
      const rect = block.getBoundingClientRect()
      return { top: rect.top - sheetRect.top, bottom: rect.bottom - sheetRect.top, keepWithNext: block.hasAttribute("data-cv-keep") }
    })
    const { pushes, pageCount: count } = paginateBlocks(measured, {
      pageHeight: MM.page * px, marginTop: MM.top * px, marginBottom: MM.bottom * px, keepLine: MM.keepLine * px,
    })
    pushes.forEach((push, index) => { if (push) blocks[index].style.paddingTop = `${push}px` })
    setPageCount(count)
  }, [])

  const frame = useRef(0)
  const paginateSoon = useCallback(() => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(paginate)
  }, [paginate])

  useLayoutEffect(() => { paginate() }, [cv, paginate])
  useLayoutEffect(() => { void document.fonts?.ready.then(paginate) }, [paginate])
  useLayoutEffect(() => {
    const sheet = sheetRef.current
    const observer = new MutationObserver(paginateSoon)
    if (sheet) observer.observe(sheet, { childList: true, subtree: true })
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current) }
  }, [paginateSoon])

  return <div id="cv-workspace-print" className="overflow-x-auto pb-4">
    <div className="cv-editor-control mx-auto mb-3 w-[210mm] space-y-2 rounded-xl bg-[#e8eeeb] px-3 py-2 text-xs font-bold text-[#405148]">
      <div className="flex items-center justify-between"><span>{pageCount} A4 {pageCount === 1 ? "page" : "pages"}</span><span>Click any text to edit · Enter adds a new line</span></div>
      {addSectionBar}
    </div>
    <article ref={sheetRef} onInput={paginateSoon} className="cv-sheet relative mx-auto w-[210mm] bg-white text-slate-800 shadow-lg" style={{ height: `${pageCount * MM.page}mm`, "--cv-pages": pageCount } as CSSProperties}>
      <div className="absolute inset-x-0 top-0 h-2 bg-[#2f5d50]" />
      {Array.from({ length: pageCount - 1 }, (_, index) => <div key={index} aria-hidden className="cv-editor-control pointer-events-none absolute -inset-x-3 h-3 bg-[#efece4] shadow-[inset_0_4px_4px_-3px_rgba(0,0,0,.18),inset_0_-4px_4px_-3px_rgba(0,0,0,.18)]" style={{ top: `calc(${(index + 1) * MM.page}mm - 6px)` }} />)}

      <div className="px-[16mm] pt-[15mm]">
        <header data-cv-block="" className="border-b border-slate-200 pb-5">
          <Editable value={cv.personalInfo.fullName} onChange={(value) => patchPersonal("fullName", value)} placeholder="YOUR NAME" className="text-3xl font-black uppercase tracking-tight text-[#18231e]" />
          <div className="mt-1"><Editable value={cv.personalInfo.title} onChange={(value) => patchPersonal("title", value)} placeholder="Professional title" className="text-sm font-bold uppercase tracking-[.14em] text-[#2f5d50]" /></div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">{(["email", "phone", "location", "linkedin"] as const).map((key) => <Editable key={key} value={cv.personalInfo[key]} onChange={(value) => patchPersonal(key, value)} placeholder={key[0].toUpperCase() + key.slice(1)} />)}</div>
        </header>

        <section className="mt-5">
          <SectionHeading title="Professional profile">
            <ToolButton label={cv.personalInfo.summary ? "Refine summary with AI" : "Draft summary with AI"} onClick={() => onAi("summary")}>{busy === "summary" ? <Loader2 className="h-3 w-3 animate-spin" /> : <PenLine className="h-3 w-3" />}</ToolButton>
          </SectionHeading>
          <EditableLines value={cv.personalInfo.summary} onChange={(value) => patchPersonal("summary", value)} placeholder="Add a concise professional summary…" className="mt-2 text-[12px] leading-[1.65] text-slate-700" />
        </section>

        <section className="mt-5">
          <SectionHeading title="Experience">
            <ToolButton label="Add role" onClick={() => onChange({ ...cv, experience: [...cv.experience, { id: crypto.randomUUID(), role: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }] })}><Plus className="h-3 w-3" /></ToolButton>
          </SectionHeading>
          <div className="mt-3 space-y-4">{cv.experience.map((item, index) => <div key={item.id}>
            <div data-cv-block="" data-cv-keep="" className="group">
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0"><Editable value={item.role} onChange={(value) => patchExperience(index, { role: value })} placeholder="Role" className="text-[13px] font-extrabold text-[#18231e]" /><p className="mt-0.5 text-[11px] font-semibold text-slate-600"><Editable value={item.company} onChange={(value) => patchExperience(index, { company: value })} placeholder="Company" />{item.company && item.location ? " · " : " "}<Editable value={item.location} onChange={(value) => patchExperience(index, { location: value })} placeholder="Location" /></p></div>
                <div className="shrink-0 text-right text-[10px] font-semibold text-slate-500"><Editable value={item.startDate} onChange={(value) => patchExperience(index, { startDate: value })} placeholder="Start" /> — <Editable value={item.endDate} onChange={(value) => patchExperience(index, { endDate: value })} placeholder="End" /></div>
                <MarginTools>
                  <ToolButton label={item.description ? "Refine with AI" : "Draft with AI"} onClick={() => onAi(`experience-${index}`)}>{busy === `experience-${index}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <PenLine className="h-3 w-3" />}</ToolButton>
                  <ToolButton label="Toggle bullets" onClick={() => patchExperience(index, { description: toggleBullets(item.description) })}><List className="h-3 w-3" /></ToolButton>
                  <ToolButton danger label="Remove role" onClick={() => onChange({ ...cv, experience: cv.experience.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 className="h-3 w-3" /></ToolButton>
                </MarginTools>
              </div>
            </div>
            <EditableLines defaultBullets value={item.description} onChange={(value) => patchExperience(index, { description: value })} placeholder="Responsibilities and achievements" className="mt-1.5 text-[11px] leading-[1.6] text-slate-700" />
          </div>)}</div>
        </section>

        <section className="mt-5">
          <SectionHeading title="Education">
            <ToolButton label="Add education" onClick={() => onChange({ ...cv, education: [...cv.education, { id: crypto.randomUUID(), institution: "", degree: "", field: "", location: "", startDate: "", endDate: "", current: false }] })}><Plus className="h-3 w-3" /></ToolButton>
          </SectionHeading>
          <div className="mt-3 space-y-3">{cv.education.map((item, index) => <div key={item.id} data-cv-block="" className="group">
            <div className="relative flex items-start justify-between gap-4">
              <div><Editable value={item.degree} onChange={(value) => patchEducation(index, { degree: value })} placeholder="Qualification" className="text-[12px] font-bold" /><p className="text-[10px] text-slate-600"><Editable value={item.institution} onChange={(value) => patchEducation(index, { institution: value })} placeholder="Institution" />{item.field ? " · " : " "}<Editable value={item.field} onChange={(value) => patchEducation(index, { field: value })} placeholder="Field" /></p></div>
              <Editable value={item.endDate} onChange={(value) => patchEducation(index, { endDate: value })} placeholder="Year" className="text-[10px] text-slate-500" />
              <MarginTools><ToolButton danger label="Remove education" onClick={() => onChange({ ...cv, education: cv.education.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 className="h-3 w-3" /></ToolButton></MarginTools>
            </div>
          </div>)}</div>
        </section>

        <section className="mt-5">
          <SectionHeading title="Core skills">
            <ToolButton label="Add skill group" onClick={() => onChange({ ...cv, skillCategories: [...categories, { id: crypto.randomUUID(), name: "", skills: [] }] })}><Plus className="h-3 w-3" /></ToolButton>
          </SectionHeading>
          <div className="mt-3 space-y-1.5">{categories.map((category, index) => <div key={category.id} data-cv-block="" className="group text-[11px] font-semibold leading-6 text-slate-700">
            <div className="relative">
              {categories.length > 1 && <span className="mr-1.5 font-extrabold text-[#18231e]"><Editable value={category.name} onChange={(value) => patchCategory(index, { name: value })} placeholder="Group name" />:</span>}
              <Editable value={category.skills.join(" · ")} onChange={(value) => patchSkills(index, value)} placeholder="Add skills separated by commas" />
              {categories.length > 1 && <MarginTools><ToolButton danger label="Remove skill group" onClick={() => onChange({ ...cv, skillCategories: categories.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 className="h-3 w-3" /></ToolButton></MarginTools>}
            </div>
          </div>)}</div>
        </section>

        {sections.map((section, index) => <section key={section.id} className="mt-5">
          <SectionHeading title={<Editable value={section.title} onChange={(value) => patchSection(index, { title: value })} placeholder="Section title" />}>
            <ToolButton label="Toggle bullets" onClick={() => toggleSectionBullets(index)}><List className="h-3 w-3" /></ToolButton>
            {index > 0 && <ToolButton label="Move section up" onClick={() => moveSection(index, -1)}><ArrowUp className="h-3 w-3" /></ToolButton>}
            {index < sections.length - 1 && <ToolButton label="Move section down" onClick={() => moveSection(index, 1)}><ArrowDown className="h-3 w-3" /></ToolButton>}
            <ToolButton danger label="Remove section" onClick={() => onChange({ ...cv, sections: sections.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 className="h-3 w-3" /></ToolButton>
          </SectionHeading>
          <EditableLines defaultBullets={section.bullets !== false} value={section.content} onChange={(value) => patchSection(index, { content: value })} placeholder="Add details…" linePlaceholder="New line" className="mt-2 text-[11px] leading-[1.6] text-slate-700" />
        </section>)}
      </div>
    </article>
    <div className="cv-editor-control mx-auto mt-3 w-[210mm] rounded-xl border border-dashed border-[#cfdcd5] bg-[#f6f9f7] px-3 py-2.5">{addSectionBar}</div>
  </div>
}
