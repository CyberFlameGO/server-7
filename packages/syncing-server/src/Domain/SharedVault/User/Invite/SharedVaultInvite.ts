import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { SharedVaultInviteProps } from './SharedVaultInviteProps'

export class SharedVaultInvite extends Entity<SharedVaultInviteProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: SharedVaultInviteProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SharedVaultInviteProps, id?: UniqueEntityId): Result<SharedVaultInvite> {
    return Result.ok<SharedVaultInvite>(new SharedVaultInvite(props, id))
  }
}
