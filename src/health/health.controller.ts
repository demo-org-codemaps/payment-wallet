import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ROLE } from '../shared';
import { Public, Roles } from '../core';

@Controller()
// @Public()
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @Roles(ROLE.ADMIN)
  @HealthCheck()
  @Public()
  check() {
    return this.health.check([]);
  }
}
