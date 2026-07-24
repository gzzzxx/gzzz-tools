/* useTools.ts — Locale-aware view of the tool catalog. */
import { computed } from 'vue'
import { useT } from './useT'
import { tools, type ToolDefinition } from '~/tools/registry'

export interface Tool extends ToolDefinition {
  name: string
  desc: string
}

export function useLocalizedTools() {
  const { t } = useT()
  const localizedTools = computed<Tool[]>(() =>
    tools.map(entry => ({
      ...entry,
      // Surface optional flags explicitly so the contract lives here,
      // not as a side effect of the spread. Adding a new optional flag
      // on ToolDefinition still works through `...entry`, but this
      // line makes the intent obvious to readers.
      isNew: entry.isNew,
      name: t(entry.nameKey),
      desc: t(entry.descKey),
    })),
  )
  return { localizedTools }
}