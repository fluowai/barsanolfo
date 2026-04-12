import { useState, useCallback } from 'react';
import { ContactFormData, FormErrors } from '../types';
import { VALIDATION, PROBLEM_TYPES } from '../constants';

export function useContactForm(onSubmit?: (data: ContactFormData) => Promise<void>) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    type: 'rescisao',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    phone: '',
    email: '',
    type: '',
    message: '',
  });

  const [isValid, setIsValid] = useState(false);

  const validateField = useCallback((name: keyof ContactFormData, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim().length < 3 ? 'O nome deve ter pelo menos 3 caracteres.' : '';
      case 'email':
        return !VALIDATION.EMAIL_REGEX.test(value) ? 'Informe um e-mail válido.' : '';
      case 'phone':
        return !VALIDATION.PHONE_REGEX.test(value) ? 'Informe um telefone válido (Ex: 11 98888-7777).' : '';
      case 'type':
        return !value ? 'Selecione o tipo de problema.' : '';
      case 'message':
        return value.trim().length < 10 ? 'Por favor, descreva seu caso com mais detalhes.' : '';
      default:
        return '';
    }
  }, []);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ContactFormData;
    
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, [validateField]);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      type: validateField('type', formData.type),
      message: validateField('message', formData.message),
    };
    
    setErrors(newErrors);
    const isFormValid = Object.values(newErrors).every(error => !error);
    setIsValid(isFormValid);
    return isFormValid;
  }, [formData, validateField]);

  const reset = useCallback(() => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      type: 'rescisao',
      message: '',
    });
    setErrors({
      name: '',
      phone: '',
      email: '',
      type: '',
      message: '',
    });
    setIsValid(false);
  }, []);

  return {
    formData,
    errors,
    isValid,
    handleChange,
    validate,
    reset,
    setFormData,
  };
}
