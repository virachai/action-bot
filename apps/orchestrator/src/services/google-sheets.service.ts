import { config } from '@repo/config';
import axios from 'axios';

/**
 * Google Sheets Service
 * Logs workflow data to Google Sheets via Google Forms
 */
export class GoogleSheetsService {
  private formUrl: string;
  private entryId: string;

  constructor() {
    this.formUrl = config.googleForms.url;
    this.entryId = config.googleForms.entryId;
  }

  /**
   * Submit data to Google Sheets
   * @param data Object to be logged (will be stringified)
   */
  async logData(data: Record<string, unknown>): Promise<void> {
    try {
      const stringifiedData = JSON.stringify(data);
      const params = new URLSearchParams();
      params.append(this.entryId, stringifiedData);

      console.log(`📊 Logging to Google Sheets: ${stringifiedData}`);

      // Google Forms returns opaque response for cors/no-cors, but for server-side axios
      // we just post. Google Forms might return html which is fine.
      await axios.post(this.formUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      console.log('✅ Google Sheets log successful');
    } catch (error) {
      // Don't throw, logging failure shouldn't stop the workflow
      console.warn(`⚠️  Google Sheets logging failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
