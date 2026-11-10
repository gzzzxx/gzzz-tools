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
      name: t(entry.nameKey),
      desc: t(entry.descKey),
    })),
  )
  return { localizedTools }
}