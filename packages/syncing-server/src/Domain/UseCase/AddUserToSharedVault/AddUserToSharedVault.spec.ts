import { TimerInterface } from '@standardnotes/time'
import { SharedVaultRepositoryInterface } from '../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { RemoveUserEvents } from '../RemoveUserEvents/RemoveUserEvents'
import { AddUserToSharedVault } from './AddUserToSharedVault'
import { Result } from '@standardnotes/domain-core'
import { SharedVault } from '../../SharedVault/SharedVault'
import { SharedVaultUser } from '../../SharedVault/User/SharedVaultUser'

describe('AddUserToSharedVault', () => {
  let removeUserEvents: RemoveUserEvents
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let timer: TimerInterface
  let sharedVault: SharedVault

  const validUuid = '00000000-0000-0000-0000-000000000000'

  const createUseCase = () =>
    new AddUserToSharedVault(removeUserEvents, sharedVaultRepository, sharedVaultUserRepository, timer)

  beforeEach(() => {
    removeUserEvents = {} as jest.Mocked<RemoveUserEvents>
    removeUserEvents.execute = jest.fn().mockResolvedValue(Result.ok())

    sharedVault = {} as jest.Mocked<SharedVault>

    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123456789)
  })

  it('should return a failure result if the shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: 'invalid-uuid',
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid-uuid')
  })

  it('should return a failure result if the user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: 'invalid-uuid',
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid-uuid')
  })

  it('should return a failure result if the permission is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'test',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid shared vault user permission test')
  })

  it('should return a failure result if the shared vault does not exist', async () => {
    const useCase = createUseCase()

    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValueOnce(null)

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Attempting to add a shared vault user to a non-existent shared vault')
  })

  it('should return a failure result if removing user events fails', async () => {
    const useCase = createUseCase()

    removeUserEvents.execute = jest.fn().mockResolvedValueOnce(Result.fail('test'))

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('test')
  })

  it('should return a failure result if creating the shared vault user fails', async () => {
    const useCase = createUseCase()

    const mockSharedVaultUser = jest.spyOn(SharedVaultUser, 'create')
    mockSharedVaultUser.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Oops')

    mockSharedVaultUser.mockRestore()
  })

  it('should add a user to a shared vault', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultUserRepository.save).toHaveBeenCalled()
  })
})
