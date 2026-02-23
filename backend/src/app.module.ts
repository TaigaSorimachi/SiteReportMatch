import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
