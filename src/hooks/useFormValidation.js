import { useState, useCallback } from 'react';

export default function useFormValidation() {
  const [errors, setErrors] = useState({});

  const validateField = useCallback((name, value, rules = {}) => {
    let error = '';

    if (rules.required && !value.trim()) {
      error = 'This field is required';
    } else if (rules.nameOnly && value) {
      if (!/^[a-zA-Z\s]+$/.test(value)) {
        error = 'Name must contain only letters and spaces';
      }
    } else if (rules.email && value) {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        error = 'Please enter a valid email address (e.g., user@example.com)';
      }
    } else if (rules.phone && value) {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length !== 11) {
        if (digitsOnly.length < 11) {
          error = `Phone number is too short. Need ${11 - digitsOnly.length} more digits (${digitsOnly.length}/11)`;
        } else {
          error = `Phone number is too long. Remove ${digitsOnly.length - 11} digits (${digitsOnly.length}/11)`;
        }
      }
    } else if (rules.select && !value) {
      error = 'Please select an option';
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  }, []);

  const clearError = useCallback((name) => {
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const clearAll = useCallback(() => {
    setErrors({});
  }, []);

  const validateAll = useCallback((fields) => {
    let allValid = true;
    fields.forEach(({ name, value, rules }) => {
      if (!validateField(name, value, rules)) {
        allValid = false;
      }
    });
    return allValid;
  }, [validateField]);

  return { errors, validateField, clearError, clearAll, validateAll };
}
