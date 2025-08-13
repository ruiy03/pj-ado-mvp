export function extractPlaceholders(html: string): string[] {
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = placeholderRegex.exec(html)) !== null) {
    const placeholder = match[1].trim();
    if (placeholder && !placeholders.includes(placeholder)) {
      placeholders.push(placeholder);
    }
  }

  return placeholders.sort();
}

const VALID_PLACEHOLDER_KEYWORDS = [
  'image', 'img', 'picture',
  'url', 'link', 'href',
  'title', 'headline', 'header',
  'description', 'text', 'content', 'body',
  'price', 'cost', 'fee',
  'button', 'cta', 'action',
  'date', 'time',
  'name', 'author', 'company'
];

export function validatePlaceholderNaming(placeholder: string): boolean {
  const lowerPlaceholder = placeholder.toLowerCase();
  return VALID_PLACEHOLDER_KEYWORDS.some(keyword => 
    lowerPlaceholder.includes(keyword)
  );
}

export function validatePlaceholders(html: string, placeholders: string[]): string[] {
  const extractedPlaceholders = extractPlaceholders(html);
  const missingInList: string[] = [];
  const unusedInHtml: string[] = [];
  const invalidNaming: string[] = [];

  extractedPlaceholders.forEach(extracted => {
    if (!placeholders.includes(extracted)) {
      missingInList.push(extracted);
    }
  });

  placeholders.forEach(placeholder => {
    if (!extractedPlaceholders.includes(placeholder)) {
      unusedInHtml.push(placeholder);
    }
    if (!validatePlaceholderNaming(placeholder)) {
      invalidNaming.push(placeholder);
    }
  });

  const errors: string[] = [];
  
  if (missingInList.length > 0) {
    errors.push(`HTMLに存在するがリストにないプレースホルダー: ${missingInList.join(', ')}`);
  }
  
  if (unusedInHtml.length > 0) {
    errors.push(`リストにあるがHTMLで使用されていないプレースホルダー: ${unusedInHtml.join(', ')}`);
  }

  if (invalidNaming.length > 0) {
    errors.push(`命名規則に違反するプレースホルダー: ${invalidNaming.join(', ')}`);
  }

  return errors;
}
