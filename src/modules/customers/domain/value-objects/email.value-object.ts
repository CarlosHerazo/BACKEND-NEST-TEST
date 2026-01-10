/**
 * Email Value Object
 * Ensures email validity in the domain
 */
export class Email {
  private readonly value: string;

  constructor(email: string) {
    const sanitized = email.toLowerCase().trim();
    if (!this.isValid(sanitized)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    this.value = sanitized;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
