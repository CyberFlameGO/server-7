import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'
import { SharedVaultInviteType } from '../Model/SharedVaultInviteType'

export type SharedVaultInviteHash = {
  uuid: string
  user_uuid: string
  shared_vault_uuid: string
  inviter_uuid: string
  inviter_public_key: string
  encrypted_vault_key_content: string
  invite_type: SharedVaultInviteType
  permissions: SharedVaultUserPermission
  created_at_timestamp?: number
  updated_at_timestamp?: number
}