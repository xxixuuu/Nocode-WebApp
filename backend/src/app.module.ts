import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ProjectsModule } from './modules/projects/projects.module';
import { CodegenModule } from './modules/codegen/codegen.module';
import { OllamaModule } from './modules/ollama/ollama.module';
import { DeployModule } from './modules/deploy/deploy.module';
import { AuthModule } from './modules/auth/auth.module';
import { SandboxModule } from './modules/sandbox/sandbox.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60'),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),

    // Bull Queue
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Feature modules
    AuthModule,
    ProjectsModule,
    CodegenModule,
    OllamaModule,
    DeployModule,
    SandboxModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
