import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Casino Platform API',
      version: '1.0.0',
      description: 'Full-featured online casino platform backend',
      endpoints: {
        docs: '/api/docs',
        health: '/api/health',
      },
    };
  }
}
