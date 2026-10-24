import { asset } from './asset'

export type Tier = 'head' | 'lead' | 'middle' | 'junior'

export type Member = {
  id: string
  firstName: string
  lastName: string
  role: string
  tier: Tier
  telegram: string
  avatar: string
}

// Порядок важен: это иерархия отдела, сцена и сетка идут строго по нему.
export const team: Member[] = [
  { id: 'iskander', firstName: 'Искандер', lastName: 'Чарыев', role: 'Head of Technical Support', tier: 'head', telegram: 'https://t.me/XandR_tsPD', avatar: asset('avatars/iskander.webp') },
  { id: 'eziz', firstName: 'Эзиз', lastName: 'Дурдыев', role: 'Technical Support Lead', tier: 'lead', telegram: 'https://t.me/han_tm', avatar: asset('avatars/eziz.webp') },
  { id: 'ovez', firstName: 'Овез', lastName: 'Аннаклычев', role: 'Technical Support Middle', tier: 'middle', telegram: 'https://t.me/i_am_ObeOne', avatar: asset('avatars/ovez.webp') },
  { id: 'muhammed', firstName: 'Мухаммед', lastName: 'Полатов', role: 'Technical Support Middle', tier: 'middle', telegram: 'https://t.me/impolo98', avatar: asset('avatars/muhammed.webp') },
  { id: 'bayram', firstName: 'Байрам', lastName: 'Реджепов', role: 'Technical Support Junior', tier: 'junior', telegram: 'https://t.me/bvyram', avatar: asset('avatars/bayram.webp') },
  { id: 'metin', firstName: 'Метин', lastName: 'Кулиев', role: 'Technical Support Junior', tier: 'junior', telegram: 'https://t.me/mtkv1909', avatar: asset('avatars/metin.webp') },
  { id: 'rasim', firstName: 'Расим', lastName: 'Мамедов', role: 'Technical Support Junior', tier: 'junior', telegram: 'https://t.me/rmamedov001', avatar: asset('avatars/rasim.webp') },
  { id: 'arslan', firstName: 'Арслан', lastName: 'Бердыев', role: 'Technical Support Junior', tier: 'junior', telegram: 'https://t.me/Arslannnnn', avatar: asset('avatars/arslan.webp') },
  { id: 'shyhmyrat', firstName: 'Шихмурат', lastName: 'Атаев', role: 'Technical Support Junior', tier: 'junior', telegram: 'https://t.me/unknownuser_t', avatar: asset('avatars/shyhmyrat.webp') },
  { id: 'dovlet', firstName: 'Довлет', lastName: 'Гурбанов', role: 'Technical Support Junior', tier: 'junior', telegram: 'https://t.me/dovletkurbanov', avatar: asset('avatars/dovlet.webp') },
]

export const tierLabel: Record<Tier, string> = {
  head: 'Head',
  lead: 'Lead',
  middle: 'Middle',
  junior: 'Junior',
}
