export const generateWeatherRecommendation = (weather) => {
  const rec = []
  if (weather.temperature > 40) rec.push('Extremely hot. Avoid outdoor work 11am–3pm. Increase irrigation urgently.')
  if (weather.temperature < 10) rec.push('Cold risk. Cover sensitive crops with mulch or nets.')
  if (weather.humidity > 85) rec.push('High humidity. Monitor crops for fungal diseases closely.')
  if (weather.windSpeed > 30) rec.push('Strong winds. Support tall crops with stakes.')
  if (weather.uvIndex > 8) rec.push('High UV. Wear protective clothing and sunscreen.')
  if (weather.rainfall > 50) rec.push('Heavy rainfall expected. Check field drainage.')
  return rec.length > 0 ? rec.join(' | ') : 'Weather conditions are suitable for normal farming activities.'
}

export const getSeasonalCrops = () => {
  const month = new Date().getMonth() + 1
  if (month >= 6 && month <= 9) return { season: 'Kharif', crops: ['Rice','Maize','Cotton','Soybean','Groundnut','Moong'] }
  if (month >= 10 || month <= 2) return { season: 'Rabi', crops: ['Wheat','Mustard','Potato','Onion','Gram','Barley'] }
  return { season: 'Zaid', crops: ['Watermelon','Moong','Cucumber','Maize','Bitter Gourd','Pumpkin'] }
}
