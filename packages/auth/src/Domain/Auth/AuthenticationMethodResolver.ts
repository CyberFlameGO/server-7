import { SessionTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { AuthenticationMethod } from './AuthenticationMethod'
import { AuthenticationMethodResolverInterface } from './AuthenticationMethodResolverInterface'
import { Logger } from 'winston'

@injectable()
export class AuthenticationMethodResolver implements AuthenticationMethodResolverInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_SessionService) private sessionService: SessionServiceInterface,
    @inject(TYPES.Auth_SessionTokenDecoder) private sessionTokenDecoder: TokenDecoderInterface<SessionTokenData>,
    @inject(TYPES.Auth_FallbackSessionTokenDecoder)
    private fallbackSessionTokenDecoder: TokenDecoderInterface<SessionTokenData>,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async resolve(token: string): Promise<AuthenticationMethod | undefined> {
    let decodedToken: SessionTokenData | undefined = this.sessionTokenDecoder.decodeToken(token)
    if (decodedToken === undefined) {
      this.logger.debug('Could not decode token with primary decoder, trying fallback decoder.')

      decodedToken = this.fallbackSessionTokenDecoder.decodeToken(token)
    }

    if (decodedToken) {
      this.logger.debug('Token decoded successfully. User found.')

      return {
        type: 'jwt',
        user: await this.userRepository.findOneByUuid(<string>decodedToken.user_uuid),
        claims: decodedToken,
      }
    }

    const session = await this.sessionService.getSessionFromToken(token)
    if (session) {
      this.logger.debug('Token decoded successfully. Session found.')

      return {
        type: 'session_token',
        user: await this.userRepository.findOneByUuid(session.userUuid),
        session: session,
      }
    }

    const revokedSession = await this.sessionService.getRevokedSessionFromToken(token)
    if (revokedSession) {
      this.logger.debug('Token decoded successfully. Revoked session found.')

      return {
        type: 'revoked',
        revokedSession: await this.sessionService.markRevokedSessionAsReceived(revokedSession),
        user: null,
      }
    }

    this.logger.debug('Could not decode token.')

    return undefined
  }
}
