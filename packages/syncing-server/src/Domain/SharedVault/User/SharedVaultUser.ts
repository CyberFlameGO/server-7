import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { SharedVaultUserProps } from './SharedVaultUserProps'

export class SharedVaultUser extends Entity<SharedVaultUserProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: SharedVaultUserProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SharedVaultUserProps, id?: UniqueEntityId): Result<SharedVaultUser> {
    return Result.ok<SharedVaultUser>(new SharedVaultUser(props, id))
  }
}
