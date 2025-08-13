// Re-export all functions from the modular structure for backward compatibility
export {
  extractPlaceholders,
  getSampleValue
} from './template-utils/placeholder-extraction';

export {
  validatePlaceholders,
  validatePlaceholderNaming
} from './template-utils/validation';

export {
  addNofollowToLinks,
  removeNofollowFromLinks,
  sanitizeLinksForPreview
} from './template-utils/link-processing';

export {
  VALID_PLACEHOLDER_KEYWORDS,
  REQUIRED_PLACEHOLDERS
} from './template-utils/constants';
