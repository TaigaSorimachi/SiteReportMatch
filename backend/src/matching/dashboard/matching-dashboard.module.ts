import { Module } from '@nestjs/common';
import { ContractsModule } from '../contracts/contracts.module';

/**
 * ダッシュボードモジュール
 * ダッシュボードエンドポイントはContractsControllerに含まれるため、
 * ContractsModuleを再エクスポートする。
 */
@Module({
  imports: [ContractsModule],
  exports: [ContractsModule],
})
export class MatchingDashboardModule {}
