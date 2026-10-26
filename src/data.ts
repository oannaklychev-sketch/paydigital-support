import { asset } from './asset'

export type Tier = 'head' | 'lead' | 'middle' | 'junior'

export type Member = {
  id: string
  firstName: string
  lastName: string
  role: string
  tier: Tier
  avatar: string
  height?: number
}

export const team: Member[] = [
  { id: 'iskander', firstName: 'Искандер', lastName: 'Чарыев', role: 'Head of Technical Support', tier: 'head', avatar: asset('avatars/iskander.webp') },
  { id: 'eziz', firstName: 'Эзиз', lastName: 'Дурдыев', role: 'Technical Support Lead', tier: 'lead', avatar: asset('avatars/eziz.webp'), height: 1.06 },
  { id: 'ovez', firstName: 'Овез', lastName: 'Аннаклычев', role: 'Technical Support Middle', tier: 'middle', avatar: asset('avatars/ovez.webp') },
  { id: 'muhammed', firstName: 'Мухаммед', lastName: 'Полатов', role: 'Technical Support Middle', tier: 'middle', avatar: asset('avatars/muhammed.webp') },
  { id: 'bayram', firstName: 'Байрам', lastName: 'Реджепов', role: 'Technical Support Junior', tier: 'junior', avatar: asset('avatars/bayram.webp') },
  { id: 'metin', firstName: 'Метин', lastName: 'Кулиев', role: 'Technical Support Junior', tier: 'junior', avatar: asset('avatars/metin.webp') },
  { id: 'rasim', firstName: 'Расим', lastName: 'Мамедов', role: 'Technical Support Junior', tier: 'junior', avatar: asset('avatars/rasim.webp') },
  { id: 'arslan', firstName: 'Арслан', lastName: 'Бердыев', role: 'Technical Support Junior', tier: 'junior', avatar: asset('avatars/arslan.webp') },
  { id: 'shyhmyrat', firstName: 'Шихмурат', lastName: 'Атаев', role: 'Technical Support Junior', tier: 'junior', avatar: asset('avatars/shyhmyrat.webp') },
  { id: 'dovlet', firstName: 'Довлет', lastName: 'Гурбанов', role: 'Technical Support Junior', tier: 'junior', avatar: asset('avatars/dovlet.webp') },
]

export const tierLabel: Record<Tier, string> = {
  head: 'Head',
  lead: 'Lead',
  middle: 'Middle',
  junior: 'Junior',
}
