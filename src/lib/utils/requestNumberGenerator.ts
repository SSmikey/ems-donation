/**
 * Request Number Generator
 * สร้างหมายเลขคำขอในรูปแบบ R2501030001 (R + yymmdd + sequential)
 */

import { Db } from 'mongodb';

export class RequestNumberGenerator {
  constructor(private db: Db) {}

  /**
   * Generate unique request number
   * Format: R + yymmdd + 0001
   * Example: R2501030001 = Request on 2025-01-03, sequence 0001
   */
  async generateRequestNo(): Promise<string> {
    const requestCollection = this.db.collection('distribution_requests');

    const today = new Date();
    const year = today.getFullYear().toString().slice(2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const prefix = `R${year}${month}${day}`;

    // Find last request of today with same prefix
    const lastRequest = await requestCollection
      .findOne(
        {
          requestNo: { $regex: `^${prefix}` },
        },
        {
          sort: { requestNo: -1 },
        }
      );

    let nextSequence = 1;

    if (lastRequest && lastRequest.requestNo) {
      // Extract last 4 digits and increment
      const lastSeq = parseInt(lastRequest.requestNo.slice(-4), 10);
      nextSequence = lastSeq + 1;
    }

    // Check if sequence exceeds 9999
    if (nextSequence > 9999) {
      throw new Error('Request number sequence exceeded maximum value (9999)');
    }

    const sequenceStr = nextSequence.toString().padStart(4, '0');
    return `${prefix}${sequenceStr}`;
  }

  /**
   * Verify request number format
   */
  static verifyFormat(requestNo: string): boolean {
    const pattern = /^R\d{6}\d{4}$/; // R + 6 digits (yymmdd) + 4 digits (sequence)
    return pattern.test(requestNo);
  }

  /**
   * Parse request number to get date
   */
  static parseDate(requestNo: string): Date | null {
    if (!RequestNumberGenerator.verifyFormat(requestNo)) {
      return null;
    }

    const dateStr = requestNo.substring(1, 7); // Extract yymmdd
    const year = parseInt(`20${dateStr.substring(0, 2)}`, 10);
    const month = parseInt(dateStr.substring(2, 4), 10);
    const day = parseInt(dateStr.substring(4, 6), 10);

    try {
      const date = new Date(year, month - 1, day);
      return date;
    } catch {
      return null;
    }
  }

  /**
   * Get sequence number from request number
   */
  static getSequence(requestNo: string): number | null {
    if (!RequestNumberGenerator.verifyFormat(requestNo)) {
      return null;
    }

    return parseInt(requestNo.slice(-4), 10);
  }
}
