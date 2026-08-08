export type Evaluation = 'good' | 'mid' | 'bad'

export type PracticeSource = 'practice' | 'review' | 'playlist'

export interface Card {
  id: number
  character: string
  ease: number
  interval: number
  repetitions: number
  due_date: string
  priority: boolean
  starred: boolean
  created_at: string
}

export interface PracticeRecord {
  id: number
  card_id: number | null
  character: string
  evaluation: Evaluation
  is_new: boolean
  source: PracticeSource
  practiced_at: string
}

export interface Playlist {
  id: number
  name: string
  created_at: string
}

export interface PlaylistItem {
  id: number
  playlist_id: number
  character: string
  position: number
  added_at: string
}

export interface PlaylistWithCount extends Playlist {
  item_count: number
}

export interface Sm2Input {
  ease: number
  interval: number
  repetitions: number
  evaluation: Evaluation
  is_new: boolean
}

export interface Sm2Result {
  ease: number
  interval: number
  repetitions: number
  due_date: string
  priority: boolean
}

export type GridType = 'mi' | 'tian' | 'gong'
