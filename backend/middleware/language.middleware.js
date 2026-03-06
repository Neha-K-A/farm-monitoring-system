import { SUPPORTED_LANGUAGES } from '../utils/languageHelper.js'

export const languageMiddleware = (req, res, next) => {
  const headerLang = req.headers['accept-language']?.split(',')[0]?.substring(0, 2)
  const userLang = req.user?.language
  
  const resolvedLang = (
    userLang && SUPPORTED_LANGUAGES.includes(userLang) ? userLang :
    headerLang && SUPPORTED_LANGUAGES.includes(headerLang) ? headerLang :
    'en'
  )
  
  req.userLanguage = resolvedLang
  next()
}
