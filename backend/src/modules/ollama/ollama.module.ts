import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { OllamaService } from './ollama.service';
import { OllamaController } from './ollama.controller';
import { AITasksProcessor } from './ai-tasks.processor';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'ai-tasks',
    }),
  ],
  controllers: [OllamaController],
  providers: [OllamaService, AITasksProcessor],
  exports: [OllamaService],
})
export class OllamaModule {}
