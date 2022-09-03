export interface Session {
  seshId: string
  verificationKey: string
  teleId: string | number
  accessed: boolean
  verified: boolean
}
