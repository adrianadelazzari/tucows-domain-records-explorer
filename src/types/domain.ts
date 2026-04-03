export type DomainStatus = 'active' | 'clientHold' | 'pendingTransfer'

export interface Domain {
  domain: string
  registrar?: string | null
  status: DomainStatus
  created_at?: string | null
  expires_at?: string | null
  updated_at?: string | null
  nameservers?: string[] | null
}
