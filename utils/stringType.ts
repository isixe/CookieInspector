import { CookieType } from '@/types/cookie'

/**
 * Get the type of the specified string
 * @param value string value
 */
export function getStringType(value: string): CookieType {
  if (!value) {
    return 'string'
  }

  // Check if it's a number
  if (!isNaN(Number(value)) && value.trim() !== '') {
    return 'number'
  }

  // Check if it's a boolean
  if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
    return 'boolean'
  }

  // Check if it's a date
  const dateRegex =
    /^\d{4}-\d{2}-\d{2}|^\w{3},\s\d{2}\s\w{3}\s\d{4}|^\d{10,13}$/
  if (
    !isNaN(Date.parse(value)) ||
    dateRegex.test(value) ||
    (!isNaN(Number(value)) && value.length === 10 && Number(value) > 1000000000)
  ) {
    return 'date'
  }

  // Check if it's JSON
  try {
    JSON.parse(value)
    return 'json'
  } catch (e) {
    // Not JSON
  }

  // Check if it's a URL or URL-encoded
  if (
    value.startsWith('http') ||
    value.includes('%') ||
    (value.includes('+') && value.includes('='))
  ) {
    return 'url'
  }

  return 'string'
}

/**
 * Get the color of the specified type
 * @param type type of the object
 * @returns color class
 */
export function getTypeColor(type: string) {
  switch (type) {
    case 'string':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:no-underline hover:bg-blue-100 dark:hover:bg-blue-900'
    case 'number':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:no-underline hover:bg-green-100 dark:hover:bg-green-900'
    case 'boolean':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 hover:no-underline hover:bg-purple-100 dark:hover:bg-purple-900'
    case 'date':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:no-underline hover:bg-yellow-100 dark:hover:bg-yellow-900'
    case 'json':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 hover:no-underline hover:bg-pink-100 dark:hover:bg-pink-900'
    case 'url':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 hover:no-underline hover:bg-indigo-100 dark:hover:bg-indigo-900'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-800'
  }
}
