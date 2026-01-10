import { Phone } from './phone.value-object';

describe('Phone Value Object', () => {
  describe('constructor', () => {
    it('should create a valid phone number', () => {
      const phone = new Phone('+573001234567');
      expect(phone.getValue()).toBe('+573001234567');
    });

    it('should accept phone without country code', () => {
      const phone = new Phone('3001234567');
      expect(phone.getValue()).toBe('3001234567');
    });

    it('should sanitize phone by removing non-digit characters except +', () => {
      const phone = new Phone('+57 (300) 123-4567');
      expect(phone.getValue()).toBe('+573001234567');
    });

    it('should throw error for too short phone numbers', () => {
      expect(() => new Phone('123456789')).toThrow('Invalid phone format');
    });

    it('should throw error for too long phone numbers', () => {
      expect(() => new Phone('1234567890123456')).toThrow('Invalid phone format');
    });

    it('should sanitize and accept phone with letters if result is valid', () => {
      // After sanitization, 'abc1234567890' becomes '1234567890' which is valid
      const phone = new Phone('abc1234567890');
      expect(phone.getValue()).toBe('1234567890');
    });
  });

  describe('equals', () => {
    it('should return true for equal phone numbers', () => {
      const phone1 = new Phone('+573001234567');
      const phone2 = new Phone('+573001234567');
      expect(phone1.equals(phone2)).toBe(true);
    });

    it('should return false for different phone numbers', () => {
      const phone1 = new Phone('+573001234567');
      const phone2 = new Phone('+573009876543');
      expect(phone1.equals(phone2)).toBe(false);
    });
  });
});
