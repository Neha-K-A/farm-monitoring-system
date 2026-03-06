export const calculateCropProfit = (crop) => {
  const totalRevenue = (crop.actualYield?.quantity || 0) * (crop.marketPrice || 0)
  const totalInputCost = (crop.inputs || []).reduce((sum, i) => sum + (i.totalCost || 0), 0)
  const grossProfit = totalRevenue - totalInputCost
  const profitMargin = totalRevenue > 0 ? +((grossProfit / totalRevenue) * 100).toFixed(2) : 0
  const ROI = totalInputCost > 0 ? +((grossProfit / totalInputCost) * 100).toFixed(2) : 0
  return { totalRevenue, totalInputCost, grossProfit, profitMargin, ROI }
}

export const calculateProjectedProfit = (crop) => {
  const totalRevenue = (crop.yieldEstimate?.quantity || 0) * (crop.marketPrice || 0)
  const totalInputCost = (crop.inputs || []).reduce((sum, i) => sum + (i.totalCost || 0), 0)
  const grossProfit = totalRevenue - totalInputCost
  const profitMargin = totalRevenue > 0 ? +((grossProfit / totalRevenue) * 100).toFixed(2) : 0
  const ROI = totalInputCost > 0 ? +((grossProfit / totalInputCost) * 100).toFixed(2) : 0
  return { totalRevenue, totalInputCost, grossProfit, profitMargin, ROI, isProjected: true }
}

export const estimateYield = (cropName, areaInAcres) => {
  const yields = {
    wheat: 1500, rice: 1800, maize: 2000, sugarcane: 35000, cotton: 500,
    tomato: 8000, potato: 8000, onion: 6000, soybean: 800, groundnut: 1200,
    turmeric: 2500, chilli: 1500, banana: 15000, mango: 3000, mustard: 900,
    gram: 700, moong: 600, jowar: 1200, bajra: 1000, sunflower: 800
  }
  const yieldPerAcre = yields[cropName.toLowerCase()] || 1000
  return { estimatedKg: +(yieldPerAcre * areaInAcres).toFixed(2), unit: 'kg', cropName }
}

export const convertArea = (value, from, to) => {
  const toAcres = { acres: 1, hectares: 2.47105, bigha: 0.625 }
  const fromAcres = { acres: 1, hectares: 0.404686, bigha: 1.6 }
  return +(value * fromAcres[from] * toAcres[to]).toFixed(4)
}

export const calculateWaterEfficiency = (totalLiters, yieldKg) => {
  if (!yieldKg || yieldKg === 0) return 0
  return +(totalLiters / yieldKg).toFixed(2)
}

export const calculateProfitMargin = (revenue, cost) => {
  if (!revenue || revenue === 0) return 0
  return +(((revenue - cost) / revenue) * 100).toFixed(2)
}

export const calculateROI = (profit, investment) => {
  if (!investment || investment === 0) return 0
  return +((profit / investment) * 100).toFixed(2)
}
