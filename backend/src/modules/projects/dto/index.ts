import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum Framework {
  NEXTJS = 'NEXTJS',
  VITE_REACT = 'VITE_REACT',
  SVELTE = 'SVELTE',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  BUILDING = 'BUILDING',
  DEPLOYED = 'DEPLOYED',
  FAILED = 'FAILED',
}

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: Framework, default: Framework.NEXTJS })
  @IsOptional()
  @IsEnum(Framework)
  framework?: Framework;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({ enum: ProjectStatus, required: false })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
