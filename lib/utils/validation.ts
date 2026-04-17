const PHONE_NUMBER_REGEX = /^[0-9+\-\s]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidPhoneNumber(value: string): boolean {
  return PHONE_NUMBER_REGEX.test(value);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}
