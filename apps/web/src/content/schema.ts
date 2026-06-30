import { z } from 'zod'

/**
 * Base shape of every report. Each Velite collection refines this — for now we
 * keep the runtime schema in sync with the Velite config and use the generated
 * types as the source of truth.
 */
export const reportMetaSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.string().optional(),
  summary: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  body: z.string(),
})

export type ReportMeta = z.infer<typeof reportMetaSchema>
