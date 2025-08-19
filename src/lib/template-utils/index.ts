// Re-export all functions for backward compatibility
export { extractPlaceholders, getSampleValue } from './placeholder-extraction';
export { validatePlaceholders, validatePlaceholderNaming } from './validation';
export { addNofollowToLinks, removeNofollowFromLinks, sanitizeLinksForPreview } from './link-processing';
export { VALID_PLACEHOLDERS, REQUIRED_PLACEHOLDERS } from './constants';
