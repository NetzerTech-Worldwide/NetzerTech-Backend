import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class UpdatePersonalInfoDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    dateOfBirth?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    gender?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    bloodGroup?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    genotype?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    medicalCondition?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    allergies?: string;
}

export class UpdateContactInfoDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    residentialAddress?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    stateOfOrigin?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    lga?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    nationality?: string;
}

export class UpdateGuardianInfoDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    fullName?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    relationship?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    occupation?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    workAddress?: string;
}

export class UpdatePasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword: string;
}
