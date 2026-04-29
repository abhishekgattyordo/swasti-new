// lib/validations/staffValidation.ts

export interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  employeeId: string;
  dateOfBirth: string;
  dateJoined: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  qualifications: string[];
  experience: string;
  bio: string;
  status: 'active' | 'on-leave' | 'inactive';
  avatar?: File | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validation rules configuration
const VALIDATION_RULES = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-']+$/,
    patternMessage: 'First name should only contain letters, spaces, hyphens, and apostrophes',
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-']+$/,
    patternMessage: 'Last name should only contain letters, spaces, hyphens, and apostrophes',
  },
  email: {
    required: true,
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Please enter a valid email address (e.g., name@hospital.com)',
  },
  phone: {
    required: true,
    minLength: 10,
    maxLength: 20,
  },
  role: {
    required: true,
  },
  department: {
    required: true,
  },
  employeeId: {
    required: false,
    minLength: 3,
    maxLength: 20,
    pattern: /^[A-Z0-9\-]+$/i,
    patternMessage: 'Employee ID should contain only letters, numbers, and hyphens',
  },
  dateJoined: {
    required: true,
    notFuture: true,
  },
  dateOfBirth: {
    required: false,
    minAge: 18,
    maxAge: 70,
  },
  address: {
    required: false,
    minLength: 5,
  },
  city: {
    required: false,
    minLength: 2,
    pattern: /^[a-zA-Z\s\-]+$/,
    patternMessage: 'City name should only contain letters and spaces',
  },
  experience: {
    required: false,
    minValue: 0,
    maxValue: 50,
  },
};

// Helper function to calculate age from date of birth
export function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper function to check if date is in the future
export function isFutureDate(date: string): boolean {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) > today;
}

// Helper function to clean phone number (remove special characters)
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, '');
}

// Main validation function
export function validateStaffForm(formData: StaffFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // First Name Validation
  if (VALIDATION_RULES.firstName.required && !formData.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (formData.firstName) {
    const trimmedName = formData.firstName.trim();
    if (trimmedName.length < VALIDATION_RULES.firstName.minLength) {
      errors.push({ field: 'firstName', message: `First name must be at least ${VALIDATION_RULES.firstName.minLength} characters` });
    }
    if (trimmedName.length > VALIDATION_RULES.firstName.maxLength) {
      errors.push({ field: 'firstName', message: `First name cannot exceed ${VALIDATION_RULES.firstName.maxLength} characters` });
    }
    if (!VALIDATION_RULES.firstName.pattern.test(trimmedName)) {
      errors.push({ field: 'firstName', message: VALIDATION_RULES.firstName.patternMessage });
    }
  }

  // Last Name Validation
  if (VALIDATION_RULES.lastName.required && !formData.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (formData.lastName) {
    const trimmedName = formData.lastName.trim();
    if (trimmedName.length < VALIDATION_RULES.lastName.minLength) {
      errors.push({ field: 'lastName', message: `Last name must be at least ${VALIDATION_RULES.lastName.minLength} characters` });
    }
    if (trimmedName.length > VALIDATION_RULES.lastName.maxLength) {
      errors.push({ field: 'lastName', message: `Last name cannot exceed ${VALIDATION_RULES.lastName.maxLength} characters` });
    }
    if (!VALIDATION_RULES.lastName.pattern.test(trimmedName)) {
      errors.push({ field: 'lastName', message: VALIDATION_RULES.lastName.patternMessage });
    }
  }

  // Email Validation
  if (VALIDATION_RULES.email.required && !formData.email?.trim()) {
    errors.push({ field: 'email', message: 'Email address is required' });
  } else if (formData.email) {
    const trimmedEmail = formData.email.trim();
    if (trimmedEmail.length > VALIDATION_RULES.email.maxLength) {
      errors.push({ field: 'email', message: `Email cannot exceed ${VALIDATION_RULES.email.maxLength} characters` });
    }
    if (!VALIDATION_RULES.email.pattern.test(trimmedEmail)) {
      errors.push({ field: 'email', message: VALIDATION_RULES.email.patternMessage });
    }
  }

  // Phone Validation
  if (VALIDATION_RULES.phone.required && !formData.phone?.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (formData.phone) {
    const cleanPhone = cleanPhoneNumber(formData.phone);
    if (cleanPhone.length < VALIDATION_RULES.phone.minLength) {
      errors.push({ field: 'phone', message: `Phone number must have at least ${VALIDATION_RULES.phone.minLength} digits` });
    }
    if (cleanPhone.length > VALIDATION_RULES.phone.maxLength) {
      errors.push({ field: 'phone', message: `Phone number cannot exceed ${VALIDATION_RULES.phone.maxLength} digits` });
    }
  }

  // Role Validation
  if (VALIDATION_RULES.role.required && !formData.role) {
    errors.push({ field: 'role', message: 'Role is required' });
  }

  // Department Validation
  if (VALIDATION_RULES.department.required && !formData.department) {
    errors.push({ field: 'department', message: 'Department is required' });
  }

  // Employee ID Validation (Optional)
  if (formData.employeeId && formData.employeeId.trim()) {
    const trimmedId = formData.employeeId.trim();
    if (trimmedId.length < VALIDATION_RULES.employeeId.minLength) {
      errors.push({ field: 'employeeId', message: `Employee ID should be at least ${VALIDATION_RULES.employeeId.minLength} characters` });
    }
    if (trimmedId.length > VALIDATION_RULES.employeeId.maxLength) {
      errors.push({ field: 'employeeId', message: `Employee ID cannot exceed ${VALIDATION_RULES.employeeId.maxLength} characters` });
    }
    if (!VALIDATION_RULES.employeeId.pattern.test(trimmedId)) {
      errors.push({ field: 'employeeId', message: VALIDATION_RULES.employeeId.patternMessage });
    }
  }

  // Date Joined Validation
 

  // Date of Birth Validation (Optional)
  if (formData.dateOfBirth) {
    const age = calculateAge(formData.dateOfBirth);
    if (age !== null) {
      if (age < VALIDATION_RULES.dateOfBirth.minAge) {
        errors.push({ field: 'dateOfBirth', message: `Staff member must be at least ${VALIDATION_RULES.dateOfBirth.minAge} years old` });
      }
      if (age > VALIDATION_RULES.dateOfBirth.maxAge) {
        errors.push({ field: 'dateOfBirth', message: `Staff member cannot be older than ${VALIDATION_RULES.dateOfBirth.maxAge} years` });
      }
    }
  }

  // Address Validation (Optional)
  if (formData.address && formData.address.trim().length < VALIDATION_RULES.address.minLength) {
    errors.push({ field: 'address', message: `Address should be at least ${VALIDATION_RULES.address.minLength} characters` });
  }

  // City Validation (Optional)
  if (formData.city && formData.city.trim()) {
    const trimmedCity = formData.city.trim();
    if (trimmedCity.length < VALIDATION_RULES.city.minLength) {
      errors.push({ field: 'city', message: `City name should be at least ${VALIDATION_RULES.city.minLength} characters` });
    }
    if (!VALIDATION_RULES.city.pattern.test(trimmedCity)) {
      errors.push({ field: 'city', message: VALIDATION_RULES.city.patternMessage });
    }
  }

  // Experience Validation
  if (formData.experience) {
    const exp = parseFloat(formData.experience);
    if (isNaN(exp)) {
      errors.push({ field: 'experience', message: 'Experience must be a number' });
    } else if (exp < VALIDATION_RULES.experience.minValue) {
      errors.push({ field: 'experience', message: 'Experience cannot be negative' });
    } else if (exp > VALIDATION_RULES.experience.maxValue) {
      errors.push({ field: 'experience', message: `Experience cannot exceed ${VALIDATION_RULES.experience.maxValue} years` });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Real-time field validation (for individual fields)
export function validateField(fieldName: keyof StaffFormData, value: string | string[]): string | null {
  switch (fieldName) {
    case 'firstName':
      if (!value) return 'First name is required';
      if (typeof value === 'string') {
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (!VALIDATION_RULES.firstName.pattern.test(value.trim())) return VALIDATION_RULES.firstName.patternMessage;
      }
      return null;

    case 'lastName':
      if (!value) return 'Last name is required';
      if (typeof value === 'string') {
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (!VALIDATION_RULES.lastName.pattern.test(value.trim())) return VALIDATION_RULES.lastName.patternMessage;
      }
      return null;

    case 'email':
      if (!value) return 'Email is required';
      if (typeof value === 'string') {
        if (!VALIDATION_RULES.email.pattern.test(value.trim())) return VALIDATION_RULES.email.patternMessage;
      }
      return null;

    case 'phone':
      if (!value) return 'Phone number is required';
      if (typeof value === 'string') {
        const cleanPhone = cleanPhoneNumber(value);
        if (cleanPhone.length < 10) return 'Phone number must have at least 10 digits';
      }
      return null;

    case 'role':
      if (!value) return 'Role is required';
      return null;

    case 'department':
      if (!value) return 'Department is required';
      return null;

    case 'dateJoined':
      if (!value) return 'Date joined is required';
      if (typeof value === 'string' && isFutureDate(value)) return 'Date joined cannot be in the future';
      return null;

    case 'dateOfBirth':
      if (value) {
        if (typeof value === 'string') {
          const age = calculateAge(value);
          if (age !== null && age < 18) return 'Staff member must be at least 18 years old';
          if (age !== null && age > 70) return 'Staff member cannot be older than 70 years';
        }
      }
      return null;

    default:
      return null;
  }
}