export const SUPPORTED_LANGUAGES = ['en','hi','kn','ta','te','mr','gu','pa','bn','or','ml']

export const LANGUAGE_NAMES = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिंदी' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
  te: { name: 'Telugu', nativeName: 'తెలుగు' },
  mr: { name: 'Marathi', nativeName: 'मराठी' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  bn: { name: 'Bengali', nativeName: 'বাংলা' },
  or: { name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം' }
}

export const resolveLanguage = (headerValue, userLanguage) => {
  if (userLanguage && SUPPORTED_LANGUAGES.includes(userLanguage)) return userLanguage
  if (headerValue && SUPPORTED_LANGUAGES.includes(headerValue)) return headerValue
  return 'en'
}
