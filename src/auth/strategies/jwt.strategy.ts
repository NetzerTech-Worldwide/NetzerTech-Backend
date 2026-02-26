import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, BlacklistedToken } from '../../entities';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BlacklistedToken)
    private blacklistedTokenRepository: Repository<BlacklistedToken>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload): Promise<User> {
    try {
      // Extract token from request
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Check if token is blacklisted
      const blacklistedToken = await this.blacklistedTokenRepository.findOne({
        where: { token },
      });

      if (blacklistedToken) {
        throw new UnauthorizedException('Token has been revoked');
      }

      const { sub } = payload;
      
      if (!sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userRepository.findOne({
        where: { id: sub },
        relations: ['student', 'parent', 'teacher', 'admin'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Check if password was changed after token was issued
      if (user.passwordChangedAt && payload.iat) {
        const passwordChangedSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);
        if (payload.iat < passwordChangedSeconds) {
          throw new UnauthorizedException('Token has been invalidated due to password change');
        }
      }

      return user;
    } catch (error) {
      // Re-throw UnauthorizedException as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Wrap other errors
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
