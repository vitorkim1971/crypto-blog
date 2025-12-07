import { LoginCredentials, SignupCredentials, PasswordUpdate } from '@/lib/types/auth'

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password validation rules
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = []

  if (!email) {
    errors.push({ field: 'email', message: '이메일을 입력해주세요.' })
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: '올바른 이메일 형식이 아닙니다.' })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = []

  if (!password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요.' })
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push({
      field: 'password',
      message: `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
    })
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push({
      field: 'password',
      message: `비밀번호는 최대 ${PASSWORD_MAX_LENGTH}자까지 가능합니다.`,
    })
  }

  // Check for at least one number
  if (password && !/\d/.test(password)) {
    errors.push({
      field: 'password',
      message: '비밀번호는 최소 1개의 숫자를 포함해야 합니다.',
    })
  }

  // Check for at least one letter
  if (password && !/[a-zA-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: '비밀번호는 최소 1개의 영문자를 포함해야 합니다.',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate login credentials
 */
export function validateLoginCredentials(
  credentials: LoginCredentials
): ValidationResult {
  const errors: ValidationError[] = []

  const emailValidation = validateEmail(credentials.email)
  if (!emailValidation.valid) {
    errors.push(...emailValidation.errors)
  }

  if (!credentials.password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요.' })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate signup credentials
 */
export function validateSignupCredentials(
  credentials: SignupCredentials
): ValidationResult {
  const errors: ValidationError[] = []

  const emailValidation = validateEmail(credentials.email)
  if (!emailValidation.valid) {
    errors.push(...emailValidation.errors)
  }

  const passwordValidation = validatePassword(credentials.password)
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors)
  }

  if (credentials.name && credentials.name.length > 100) {
    errors.push({
      field: 'name',
      message: '이름은 최대 100자까지 가능합니다.',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate password update (with confirmation)
 */
export function validatePasswordUpdate(
  passwords: PasswordUpdate
): ValidationResult {
  const errors: ValidationError[] = []

  const passwordValidation = validatePassword(passwords.password)
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors)
  }

  if (!passwords.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: '비밀번호 확인을 입력해주세요.',
    })
  } else if (passwords.password !== passwords.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: '비밀번호가 일치하지 않습니다.',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .slice(0, 1000) // Limit length
}

/**
 * Validate name field
 */
export function validateName(name: string): ValidationResult {
  const errors: ValidationError[] = []

  if (name && name.length > 100) {
    errors.push({
      field: 'name',
      message: '이름은 최대 100자까지 가능합니다.',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
