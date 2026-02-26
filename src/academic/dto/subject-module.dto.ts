import { IsNotEmpty, IsString, IsOptional, IsInt, IsArray, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectModuleDto {
    @ApiProperty({ description: 'Module title', example: 'Introduction to Algebra' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ description: 'Module description', example: 'Basic concepts of variables and equations' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Order of the module', example: 1 })
    @IsOptional()
    @IsInt()
    order?: number;

    @ApiProperty({ description: 'Duration', example: '2 weeks' })
    @IsOptional()
    @IsString()
    duration?: string;

    @ApiProperty({ description: 'Topics covered', example: ['Variables', 'Linear Equations'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    topics?: string[];

    @ApiProperty({ description: 'Resource URLs', example: ['https://example.com/resource.pdf'] })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    resources?: string[];
}

export class UpdateSubjectModuleDto extends CreateSubjectModuleDto { }

export class SubjectModuleResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    order: number;

    @ApiProperty()
    duration: string;

    @ApiProperty()
    topics: string[];

    @ApiProperty()
    resources: string[];

    @ApiProperty()
    classId: string;
}
