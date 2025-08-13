import { VALID_PLACEHOLDER_KEYWORDS, REQUIRED_PLACEHOLDERS } from './constants';
import { extractPlaceholders } from './placeholder-extraction';

export function validatePlaceholderNaming(placeholder: string): boolean {
  if (!placeholder || placeholder.trim() === '') return false;
  
  const lowerPlaceholder = placeholder.toLowerCase();
  return VALID_PLACEHOLDER_KEYWORDS.some(keyword =>
    lowerPlaceholder.includes(keyword.toLowerCase())
  );
}

export function validatePlaceholders(html: string, placeholders: string[]): string[] {
  const extractedPlaceholders = extractPlaceholders(html);
  const missingInList: string[] = [];
  const unusedInHtml: string[] = [];
  const invalidNaming: string[] = [];
  const missingRequired: string[] = [];

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

  // 必須プレースホルダーのチェック
  REQUIRED_PLACEHOLDERS.forEach(required => {
    if (!extractedPlaceholders.includes(required)) {
      missingRequired.push(required);
    }
  });

  const errors: string[] = [];

  if (missingRequired.length > 0) {
    errors.push(`必須プレースホルダーが不足: ${missingRequired.join(', ')}`);
  }

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
