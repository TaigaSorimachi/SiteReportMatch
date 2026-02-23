import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { DatabaseModule } from './database/database.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { WorkersModule } from './workers/workers.module';
import { ProjectsModule } from './projects/projects.module';
import { ReportsModule } from './reports/reports.module';
import { GeolocationModule } from './geolocation/geolocation.module';
import { DemandModule } from './matching/demand/demand.module';
import { SupplyModule } from './matching/supply/supply.module';
import { ContractsModule } from './matching/contracts/contracts.module';
import { AccountingModule } from './accounting/accounting.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { MastersModule } from './masters/masters.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';

// 本番用: ビルド済みフロントエンドの静的配信（client/ディレクトリが存在する場合のみ）
const staticModules: any[] = [];
// __dirname = dist/src/ なので ../../client/ へ
const adminPath = join(__dirname, '..', '..', 'client', 'admin');
const frontendPath = join(__dirname, '..', '..', 'client', 'frontend');

if (existsSync(frontendPath)) {
  staticModules.push(
    ServeStaticModule.forRoot(
      {
        rootPath: adminPath,
        serveRoot: '/admin',
        exclude: ['/api/(.*)'],
      },
      {
        rootPath: frontendPath,
        exclude: ['/api/(.*)', '/admin/(.*)'],
      },
    ),
  );
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...staticModules,
    DatabaseModule,
    CompaniesModule,
    UsersModule,
    WorkersModule,
    ProjectsModule,
    ReportsModule,
    GeolocationModule,
    DemandModule,
    SupplyModule,
    ContractsModule,
    AccountingModule,
    CustomFieldsModule,
    MastersModule,
    NotificationsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
