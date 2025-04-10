import { CookieType } from '@/types/cookie'
import { z } from 'zod'

/**
 * Get the type of the specified string
 * @param str string value
 */
export function getStringType(str: string): CookieType {
  if (!str.trim()) {
    return 'string'
  }

  const checks = [
    { name: 'email', check: () => z.string().email().parse(str) },
    { name: 'uuid', check: () => z.string().uuid().parse(str) },
    {
      name: 'hex',
      check: () => {
        const hexSchema = z.string().refine((Value) => {
          // #RGB / #RRGGBB
          if (/^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(Value)) {
            return true
          }
        })
        hexSchema.parse(str)
      }
    },
    {
      name: 'boolean',
      check: () => z.boolean().parse(str)
    },
    {
      name: 'timestamp',
      check: () => {
        const timestampSchema = z.string().refine((Value) => {
          if (!isNaN(Number(Value))) {
            return false
          }
          return /^\d{10,13}$/.test(Value)
        })
        timestampSchema.parse(str)
      }
    },
    {
      name: 'json',
      check: () => {
        const jsonSchema = z
          .string()
          .refine((value) => {
            if (!isNaN(Number(value))) {
              return false
            }

            try {
              JSON.parse(value)
              return true
            } catch (_) {
              return false
            }
          })
          .transform((value) => JSON.parse(value))
        jsonSchema.parse(str)
      }
    },
    {
      name: 'image',
      check: () => {
        const imageSchema = z.string().refine((value) => {
          return /^data:image\/[a-z+]+;base64,.*/.test(value)
        })
        imageSchema.parse(str)
      }
    },
    { name: 'url', check: () => z.string().url().parse(str) },
    {
      name: 'md5',
      check: () => {
        const md5Schema = z.string().refine((Value) => {
          return /^[a-f0-9]{32}$/i.test(Value)
        })
        md5Schema.parse(str)
      }
    },
    {
      name: 'sha1',
      check: () => {
        const sha1Schema = z.string().refine((Value) => {
          return /^[a-f0-9]{40}$/i.test(Value)
        })
        sha1Schema.parse(str)
      }
    },
    {
      name: 'sha256',
      check: () => {
        const sha256Schema = z.string().refine((Value) => {
          return /^[a-f0-9]{64}$/i.test(Value)
        })
        sha256Schema.parse(str)
      }
    },
    {
      name: 'phone',
      check: () => {
        const phoneSchema = z.string().refine((Value) => {
          return /^[\+]?[0-9]{0,3}[\-]?(13|14|15|16|17|18|19)[0-9]{9}|0\d{2,3}-\d{7,8}|^0\d{2,3}-\d{7,8}-\d{1,4}/.test(
            Value
          )
        })
        phoneSchema.parse(str)
      }
    },
    { name: 'number', check: () => z.number().parse(Number(str)) },
    { name: 'date', check: () => z.date().parse(new Date(str)) }
  ]
  for (const check of checks) {
    try {
      check.check()
      return check.name as CookieType
    } catch {}
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
    case 'email':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 hover:no-underline hover:bg-teal-100 dark:hover:bg-teal-900'
    case 'url':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 hover:no-underline hover:bg-indigo-100 dark:hover:bg-indigo-900'
    case 'uuid':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 hover:no-underline hover:bg-purple-100 dark:hover:bg-purple-900'
    case 'date':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:no-underline hover:bg-yellow-100 dark:hover:bg-yellow-900'
    case 'number':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:no-underline hover:bg-green-100 dark:hover:bg-green-900'
    case 'boolean':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 hover:no-underline hover:bg-pink-100 dark:hover:bg-pink-900'
    case 'timestamp':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 hover:no-underline hover:bg-orange-100 dark:hover:bg-orange-900'
    case 'phone':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300 hover:no-underline hover:bg-cyan-100 dark:hover:bg-cyan-900'
    case 'json':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:no-underline hover:bg-red-100 dark:hover:bg-red-900'
    case 'base64':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:no-underline hover:bg-blue-100 dark:hover:bg-blue-900'
    case 'hex':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-900'
    case 'md5':
      return 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300 hover:no-underline hover:bg-lime-100 dark:hover:bg-lime-900'
    case 'sha1':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 hover:no-underline hover:bg-amber-100 dark:hover:bg-amber-900'
    case 'sha256':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 hover:no-underline hover:bg-emerald-100 dark:hover:bg-emerald-900'
    case 'string':
      return 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:no-underline hover:bg-gray-200 dark:hover:bg-gray-800'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-800'
  }
}
