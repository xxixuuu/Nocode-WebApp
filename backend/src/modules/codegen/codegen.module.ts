import { Module } from '@nestjs/common';
import { CodegenService } from './codegen.service';
import { CodegenController } from './codegen.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [CodegenController],
  providers: [CodegenService],
  exports: [CodegenService],
})
export class CodegenModule {}
