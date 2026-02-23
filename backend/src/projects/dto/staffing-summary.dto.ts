import { ApiProperty } from '@nestjs/swagger';

export class StaffingSummaryByWorkType {
  @ApiProperty({ description: '工種ID' })
  workTypeId: string | null;

  @ApiProperty({ description: '工種名' })
  workTypeName: string | null;

  @ApiProperty({ description: '必要人数合計' })
  totalRequired: number;

  @ApiProperty({ description: '確定人数合計' })
  totalConfirmed: number;

  @ApiProperty({ description: '不足人数' })
  shortage: number;
}

export class StaffingSummaryByDate {
  @ApiProperty({ description: '対象日' })
  targetDate: string;

  @ApiProperty({ description: '必要人数合計' })
  totalRequired: number;

  @ApiProperty({ description: '確定人数合計' })
  totalConfirmed: number;

  @ApiProperty({ description: '不足人数' })
  shortage: number;
}

export class StaffingSummaryResponseDto {
  @ApiProperty({ description: '案件ID' })
  projectId: string;

  @ApiProperty({ type: [StaffingSummaryByWorkType], description: '工種別サマリ' })
  byWorkType: StaffingSummaryByWorkType[];

  @ApiProperty({ type: [StaffingSummaryByDate], description: '日付別サマリ' })
  byDate: StaffingSummaryByDate[];

  @ApiProperty({ description: '総必要人数' })
  totalRequired: number;

  @ApiProperty({ description: '総確定人数' })
  totalConfirmed: number;

  @ApiProperty({ description: '総不足人数' })
  totalShortage: number;
}
