import { Injectable, OnModuleInit } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { genericRetryStrategy, GetHeadersDto } from '../../shared';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { LogDecorator } from '../../core';

@Injectable()
export class ApiWrapperService implements OnModuleInit {
  private userEndpoint: string;
  constructor(private readonly httpService: HttpService, private configService: ConfigService) {}

  onModuleInit() {
    this.userEndpoint = this.configService.get('USER_ENDPOINT');
  }

  @LogDecorator()
  async fetchRetailersDetails(headers: GetHeadersDto, limit: number, ids: string[]): Promise<any[]> {
    const res = this.httpService
      .get(`${this.userEndpoint}?select=id,phone,name,businessUnitId&limit=${limit}&id=${ids.join()}`, {
        headers: headers.toJSON(),
      })
      .pipe(genericRetryStrategy());
    const users: AxiosResponse<any> = await lastValueFrom(res);
    return users.data.data;
  }

  @LogDecorator()
  async fetchRetailerByPhone(headers: GetHeadersDto, limit: number, phone: string): Promise<any[]> {
    const res = this.httpService
      .get(`${this.userEndpoint}?select=id,phone,name,businessUnitId&limit=${limit}&phone=${phone}`, {
        headers: headers.toJSON(),
      })
      .pipe(genericRetryStrategy());
    const users: AxiosResponse<any> = await lastValueFrom(res);
    return users.data.data;
  }
}
