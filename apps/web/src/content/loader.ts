import {
  daily,
  weekly,
  monthly,
  quarterly,
  annual,
  vision,
  appendix,
  topics,
  resume,
  type daily as Daily,
  type weekly as Weekly,
  type monthly as Monthly,
  type quarterly as Quarterly,
  type annual as Annual,
  type vision as Vision,
  type appendix as Appendix,
  type topics as Topics,
  type resume as Resume,
} from './.velite'

const byDateDesc = <T extends { date?: string | undefined }>(a: T, b: T) => {
  const da = a.date ?? ''
  const db = b.date ?? ''
  return db.localeCompare(da)
}

const findBySlug = <T extends { slug: string }>(items: readonly T[], slug: string) =>
  items.find((it) => it.slug === slug)

export type { Daily, Weekly, Monthly, Quarterly, Annual, Vision, Appendix, Topics, Resume }

export const getAllDaily = (): Daily[] => [...daily].sort(byDateDesc)
export const getDailyBySlug = (slug: string): Daily | undefined => findBySlug(daily, slug)

export const getAllWeekly = (): Weekly[] => [...weekly].sort(byDateDesc)
export const getWeeklyBySlug = (slug: string): Weekly | undefined => findBySlug(weekly, slug)

export const getAllMonthly = (): Monthly[] => [...monthly].sort(byDateDesc)
export const getMonthlyBySlug = (slug: string): Monthly | undefined => findBySlug(monthly, slug)

export const getAllQuarterly = (): Quarterly[] => [...quarterly].sort(byDateDesc)
export const getQuarterlyBySlug = (slug: string): Quarterly | undefined =>
  findBySlug(quarterly, slug)

export const getAllAnnual = (): Annual[] => [...annual].sort(byDateDesc)
export const getAnnualBySlug = (slug: string): Annual | undefined => findBySlug(annual, slug)

export const getAllVision = (): Vision[] => [...vision].sort(byDateDesc)
export const getVisionBySlug = (slug: string): Vision | undefined => findBySlug(vision, slug)

export const getAllAppendix = (): Appendix[] => [...appendix].sort(byDateDesc)
export const getAppendixBySlug = (slug: string): Appendix | undefined =>
  findBySlug(appendix, slug)

export const getAllTopics = (): Topics[] => [...topics].sort(byDateDesc)
export const getTopicBySlug = (slug: string): Topics | undefined => findBySlug(topics, slug)

export const getResume = (): Resume | undefined => resume[0]
