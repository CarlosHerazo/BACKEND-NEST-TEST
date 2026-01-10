/**
 * Phone Value Object
 * Validates phone number format
 */
export class Phone {
  private readonly value: string;

  constructor(phone: string) {
    const sanitized = this.sanitize(phone);
    if (!this.isValid(sanitized)) {
      throw new Error(`Invalid phone format: ${phone}`);
    }
    this.value = sanitized;
  }

  private sanitize(phone: string): string {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '');
  }

  private isValid(phone: string): boolean {
    // Accept phone numbers with 10-15 digits, optionally starting with +
    const phoneRegex = /^\+?\d{10,15}$/;
    return phoneRegex.test(phone);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}
