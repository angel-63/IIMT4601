import { parsePhoneNumberFromString, AsYouType, getCountryCallingCode } from 'libphonenumber-js';

// List of supported country codes for formatting
const SUPPORTED_COUNTRIES: {
  [key: string]: { country: string; format: (number: string) => string };
} = {
  '+852': { country: 'HK', format: (number: string) => number.replace(/(\d{4})(\d{4})/, '$1 $2') }, // Hong Kong: +852 1234 5678
  '+1': { country: 'US', format: (number: string) => number.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') }, // US: +1 (123) 456-7890
  '+44': { country: 'GB', format: (number: string) => number.replace(/(\d{4})(\d{6})/, '$1 $2') }, // UK: +44 1234 567890
  '+86': { country: 'CN', format: (number: string) => number.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') }, // China: +86 123 4567 8900
  // Add more countries as needed
};

const DEFAULT_COUNTRY = 'HK'; // Default country for parsing if no country code is provided
const DEFAULT_COUNTRY_CODE = '+852'; // Default country code for formatting

export const handlePhoneInput = (
  text: string,
  setPhone: (value: string) => void
) => {
  // Allow digits, +, spaces, dashes, and parentheses
  let cleaned = text.replace(/[^+\d\s()-]/g, '');

  // Ensure the phone number starts with a country code
  if (!cleaned.startsWith('+')) {
    cleaned = DEFAULT_COUNTRY_CODE + cleaned.replace(/^\+/, '');
  }

  // Use AsYouType to parse and format the phone number as the user types
  const asYouType = new AsYouType();
  asYouType.input(cleaned);

  const phoneNumber = asYouType.getNumber();
  let formatted = cleaned;

  if (phoneNumber) {
    const countryCode = `+${phoneNumber.countryCallingCode}`;
    const nationalNumber = phoneNumber.nationalNumber.toString();

    console.log('Phone parsing:', { countryCode, nationalNumber, isValid: phoneNumber.isValid() });

    // Check if the country code is supported and apply custom formatting
    if (SUPPORTED_COUNTRIES[countryCode]) {
      const { format } = SUPPORTED_COUNTRIES[countryCode];
      formatted = `${countryCode} ${format(nationalNumber)}`;
    } else {
      // Fallback formatting: just add a space after the country code
      formatted = `${countryCode} ${nationalNumber}`;
    }
  } else {
    // If the phone number is not yet valid, keep the cleaned input
    formatted = cleaned;
    console.log('Phone number not valid yet:', cleaned);
  }

  setPhone(formatted);
};

export const validatePhoneNumber = (phone: string): boolean => {
  try {
    // Parse with default country if no country code is provided
    const phoneNumber = parsePhoneNumberFromString(phone, DEFAULT_COUNTRY);
    if (!phoneNumber) {
      console.log('Phone number parsing failed:', phone);
      return false;
    }

    const isValid = phoneNumber.isValid();
    console.log('Phone validation:', {
      phone,
      country: phoneNumber.country,
      nationalNumber: phoneNumber.nationalNumber,
      isValid,
    });

    return isValid;
  } catch (error) {
    console.error('Error validating phone number:', error, { phone });
    return false;
  }
};

export const getCountryCode = (phone: string): string => {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone, DEFAULT_COUNTRY);
    return phoneNumber ? `+${phoneNumber.countryCallingCode}` : DEFAULT_COUNTRY_CODE;
  } catch (error) {
    console.error('Error getting country code:', error, { phone });
    return DEFAULT_COUNTRY_CODE;
  }
};