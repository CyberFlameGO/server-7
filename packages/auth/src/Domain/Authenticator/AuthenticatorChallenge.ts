import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { AuthenticatorChallengeProps } from './AuthenticatorChallengeProps'

export class AuthenticatorChallenge extends Entity<AuthenticatorChallengeProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: AuthenticatorChallengeProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: AuthenticatorChallengeProps, id?: UniqueEntityId): Result<AuthenticatorChallenge> {
    return Result.ok<AuthenticatorChallenge>(new AuthenticatorChallenge(props, id))
  }
}
