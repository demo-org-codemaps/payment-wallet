import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { AuthService } from '../services';
import { UnAuthorizedException } from '../../shared';
import { CONSTANTS } from '../../app.constants';

@Injectable()
export class ServiceAuthStrategy extends PassportStrategy(Strategy, CONSTANTS.SERVICE_AUTH) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(request: Request): Promise<any> {
    const {
      headers: { authorization },
    } = request;
    if (!authorization) {
      throw new UnAuthorizedException('MISSING_AUTH_TOKEN');
    }
    const res = await this.authService.verifyToken({
      authToken: authorization.replace('Bearer ', ''),
    });
    return res;
  }
}
