import { TimerInterface } from '@standardnotes/time'
import { GroupUserKey } from '../Model/GroupUserKey'
import { GroupUserKeyFactoryInterface } from '../Factory/GroupUserKeyFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { GroupUserKeyRepositoryInterface } from '../Repository/GroupUserKeyRepositoryInterface'

export interface GroupUserKeyServiceInterface {
  createGroupUserKey(dto: {
    groupUuid: string
    userUuid: string
    encryptedGroupKey: string
    senderPublicKey: string
  }): Promise<GroupUserKey>

  getGroupUserKeyKeys(dto: { userUuid: string }): Promise<GroupUserKey[]>
}

export class GroupUserKeyService implements GroupUserKeyServiceInterface {
  constructor(
    private groupUserRepository: GroupUserKeyRepositoryInterface,
    private groupUserFactory: GroupUserKeyFactoryInterface,
    private timer: TimerInterface,
  ) {}

  createGroupUserKey(dto: {
    groupUuid: string
    userUuid: string
    encryptedGroupKey: string
    senderPublicKey: string
  }): Promise<GroupUserKey> {
    const groupUser = this.groupUserFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      group_uuid: dto.groupUuid,
      encrypted_group_key: dto.encryptedGroupKey,
      sender_public_key: dto.senderPublicKey,
      created_at_timestamp: this.timer.getTimestampInSeconds(),
      updated_at_timestamp: this.timer.getTimestampInSeconds(),
    })

    return this.groupUserRepository.create(groupUser)
  }

  getGroupUserKeyKeys(dto: { userUuid: string }): Promise<GroupUserKey[]> {
    return this.groupUserRepository.findAll({ userUuid: dto.userUuid })
  }
}
