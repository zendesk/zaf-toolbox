export const INTERNATIONAL_PHONE_NUMBER_REGEX = /^\+[0-9]{1,3}[0-9]{4,14}$/;

/**
 * Matches a Whatsapp Business System User ID (BSUID).
 * Shape: two uppercase ASCII letters (country code), a dot, then one or more alphanumeric characters.
 * Example: US.13491208655302741918
 */
export const BSUID_REGEX = /^[A-Z]{2}\.[A-Za-z0-9]+$/;
