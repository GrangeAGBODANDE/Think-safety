export type UserRole = 'user' | 'admin' | 'moderateur'

export interface Profile {
  id: string
  email: string
  nom: string
  prenom: string
  role: UserRole
  secteur?: string
  region?: string
  organisation?: string
  avatar_url?: string
  created_at: string
}
