import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../../entities/learning-material.entity';

export class LearningMaterialDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: FileType })
  fileType: FileType;

  @ApiProperty({ nullable: true })
  duration: string;

  @ApiProperty()
  views: number;
}

export class LectureNoteSectionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  topic: string;

  @ApiProperty({ nullable: true })
  content: string;

  @ApiProperty()
  order: number;
}

export class LectureNoteDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  content: string;

  @ApiProperty({ nullable: true })
  downloadUrl: string;

  @ApiProperty({ type: [LectureNoteSectionDto] })
  sections: LectureNoteSectionDto[];
}

export class LearningMaterialDetailDto extends LearningMaterialDto {
  @ApiProperty({ nullable: true })
  description: string;

  @ApiProperty()
  subject: string;

  @ApiProperty({ type: [LectureNoteDto] })
  lectureNotes: LectureNoteDto[];
}
