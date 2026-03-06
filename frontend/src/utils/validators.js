export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validatePhone = (phone) => {
  const regex = /^[\d\s\-\+\(\)]{10,}$/;
  return regex.test(phone);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

export const validateNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export const validateYear = (year) => {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

export const validate = {
  email: validateEmail,
  password: validatePassword,
  phone: validatePhone,
  required: validateRequired,
  number: validateNumber,
  year: validateYear,
  name: validateName,
};

export const getEmailError = (email) => {
  if (!email) return 'Email is required';
  if (!validateEmail(email)) return 'Please enter a valid email address';
  return '';
};

export const getPasswordError = (password) => {
  if (!password) return 'Password is required';
  if (!validatePassword(password)) return 'Password must be at least 6 characters';
  return '';
};

export const getPhoneError = (phone) => {
  if (!phone) return 'Phone number is required';
  if (!validatePhone(phone)) return 'Please enter a valid phone number';
  return '';
};

export const getNameError = (name) => {
  if (!name) return 'Name is required';
  if (!validateName(name)) return 'Name must be between 2 and 100 characters';
  return '';
};
