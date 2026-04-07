import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { TableRepository } from '../models/tables/repositories';
import { TableNotFoundException } from '../models/tables/exceptions';
import { generateBase64UrlToken } from '../common/utilities/string.util';
import { tableConfig } from '../models/tables/table.config';
import { AppConfigService } from '../config/app/config.service';
import { MqttService } from '../providers/mqtt/mqtt.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class QrService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly mqttService: MqttService,
    private readonly tableRepository: TableRepository,
  ) {}

  /**
   * Refresh the QR code for a specific table by generating a new token and publishing the
   * new QR code URL to the MQTT topic.
   *
   * @param tableId - The ID of the table for which to refresh the QR code.
   * @returns A promise that resolves when the QR code has been refreshed and published.
   * @throws TableNotFoundException if the table with the specified ID does not exist.
   */
  async refreshTableQr(tableId: string) {
    const table = await this.tableRepository.findById(tableId);
    if (!table) throw new TableNotFoundException(tableId);

    // Generate a new QR token and update the table
    const token = generateBase64UrlToken(tableConfig.qr.token.length);
    await this.tableRepository.update(tableId, { currentToken: token });

    // Generate the URL for the QR code
    // const frontendUrl = this.appConfigService.frontendUrl;
    // const qrUrl = `${frontendUrl}/scan?tableId=${table.id}&token=${token}`;
    const qrUrl = `192.168.1.101:3001/session/test-scan?tableId=${table.id}&token=${token}`;
    this.logger.log(
      `Generated new QR code URL for table ${table.id}: ${qrUrl}`,
    );

    // Publish the new QR code URL to the MQTT topic for this table
    const topic = `r/tables/${table.hardwareId}/qr`;
    this.mqttService.push(topic, qrUrl);
  }

  /**
   * Automatically refresh QR codes for all idle tables every 10 minutes. This ensures
   * that QR codes remain valid and secure, preventing unauthorized access from stale QR codes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  private async autoRefreshTableQr() {
    this.logger.log('Starting automatic QR code refresh for all idle tables');
    const idleTables = await this.tableRepository.findIdleTables();
    for (const t of idleTables) {
      try {
        await this.refreshTableQr(t.id!);
        // this.logger.log(`Refreshed QR code for table ${t.id}`);
      } catch (e) {
        this.logger.error(
          `Failed to refresh QR code for table ${t.id}`,
          e instanceof Error ? e.stack : JSON.stringify(e),
        );
      }
    }
    this.logger.log('Completed automatic QR code refresh for all idle tables');
  }
}
