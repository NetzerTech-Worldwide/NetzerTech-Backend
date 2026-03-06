import { ApiProperty } from '@nestjs/swagger';

export class UpdatePersonalInfoDto {
    @ApiProperty({ required: false })
    dateOfBirth?: string;

    @ApiProperty({ required: false })
    gender?: string;

    @ApiProperty({ required: false })
    bloodGroup?: string;

    @ApiProperty({ required: false })
    genotype?: string;

    @ApiProperty({ required: false })
    medicalCondition?: string;

    @ApiProperty({ required: false })
    allergies?: string;
}

export class UpdateContactInfoDto {
    @ApiProperty({ required: false })
    phoneNumber?: string;

    @ApiProperty({ required: false })
    residentialAddress?: string;

    @ApiProperty({ required: false })
    stateOfOrigin?: string;

    @ApiProperty({ required: false })
    lga?: string;

    @ApiProperty({ required: false })
    nationality?: string;
}

export class UpdateGuardianInfoDto {
    @ApiProperty({ required: false })
    fullName?: string;

    @ApiProperty({ required: false })
    relationship?: string;

    @ApiProperty({ required: false })
    phoneNumber?: string;

    @ApiProperty({ required: false })
    email?: string;

    @ApiProperty({ required: false })
    occupation?: string;

    @ApiProperty({ required: false })
    workAddress?: string;
}

export class UpdatePasswordDto {
    @ApiProperty()
    oldPassword: string;

    @ApiProperty()
    newPassword: string;
}
