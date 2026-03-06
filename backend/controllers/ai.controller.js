import axios from 'axios'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Query Ollama AI assistant for agricultural advice
export const queryAI = asyncHandler(async (req, res) => {
  const { query } = req.body

  if (!query || query.trim() === '') {
    throw new ApiError(400, 'Query is required')
  }

  try {
    // Try to connect to local Ollama instance on port 11434
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
    const model = process.env.OLLAMA_MODEL || 'mistral'

    const systemPrompt = `You are an expert agricultural assistant helping Indian farmers. Provide practical, actionable advice about:
- Crop selection and seasonal planting
- Pest and disease management
- Soil health and fertilization
- Water management and irrigation
- Weather impacts on farming
- Government schemes and subsidies
- Market trends and pricing

Be concise, practical, and culturally relevant to Indian farming practices. Include tips for sustainable and organic farming where applicable.`

    const response = await axios.post(`${ollamaUrl}/api/generate`, {
      model: model,
      prompt: query,
      system: systemPrompt,
      stream: false,
      temperature: 0.7
    }, { timeout: 30000 })

    const answer = response.data.response || response.data.text || 'No response generated'

    res.json(
      new ApiResponse(200, {
        query,
        answer,
        model: model,
        source: 'ollama'
      }, 'AI response generated')
    )
  } catch (error) {
    // Fallback to mock response if Ollama is not available
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      return res.json(
        new ApiResponse(200, {
          query,
          answer: getMockFarmingAdvice(req.body.query),
          model: 'mock',
          source: 'mock'
        }, 'AI response generated (mock mode)')
      )
    }

    throw new ApiError(500, `Failed to get AI response: ${error.message}`)
  }
})

// Get chat history for a user (for future implementation)
export const getChatHistory = asyncHandler(async (req, res) => {
  // This is a placeholder for future chat history storage
  res.json(new ApiResponse(200, [], 'Chat history retrieved'))
})

// Mock farming advice function
function getMockFarmingAdvice(query) {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('yellow') || lowerQuery.includes('leaf')) {
    return `Yellowing leaves on crops can be caused by several factors:

1. **Nutrient Deficiency** - Lack of nitrogen is common. Apply urea 46% at 50 kg/hectare.
2. **Pest Attack** - Check for spider mites or aphids. Spray neem oil (3%) in the early morning.
3. **Disease** - Could be fungal. Use fungicide like Carbendazim 50% WP at 0.5% concentration.
4. **Overwatering** - Ensure proper drainage to prevent root rot.
5. **Soil pH** - Get soil tested. Some crops prefer 6-7 pH.

Recommended Action:
- Inspect the field carefully for pests
- Test soil for nutrient levels
- Ensure adequate drainage
- Consider foliar spray with 2% DAP for quick nutrient boost

Visit your local agricultural extension office for free soil testing.`
  }

  if (lowerQuery.includes('pest') || lowerQuery.includes('insect')) {
    return `Common pest management strategies:

1. **Preventive Measures**:
   - Crop rotation to break pest lifecycle
   - Use pest-resistant varieties
   - Destroy crop residues after harvest

2. **Biological Control**:
   - Introduce natural predators like ladybugs
   - Use Trichoderma and Bacillus subtilis biofertilizers

3. **Chemical Control** (as last resort):
   - Neem oil spray for soft-bodied insects
   - Spinosad for caterpillars
   - Cypermethrin for hard-bodied insects

4. **Monitoring**:
   - Check plants weekly
   - Use yellow sticky traps
   - Keep pest count records

Apply pesticides in early morning or late evening for better efficacy.`
  }

  if (lowerQuery.includes('water') || lowerQuery.includes('irrigation')) {
    return `Efficient irrigation management is crucial:

1. **Water Requirement by Crop**:
   - Rice: 1000-1500 mm per season
   - Wheat: 375-500 mm per season
   - Cotton: 600-1000 mm per season

2. **Irrigation Methods**:
   - Flood irrigation: 40-50% efficient
   - Drip irrigation: 85-95% efficient (recommended)
   - Sprinkler irrigation: 75-85% efficient

3. **Scheduling**:
   - Water based on soil moisture
   - Use tensiometers for measurement
   - Schedule irrigation during cool hours

4. **Water Conservation**:
   - Mulching reduces evaporation
   - Use drip/sprinkler systems
   - Practice rainwater harvesting
   - Apply micro-irrigation for vegetables

Check your local water availability and subsidy schemes for drip irrigation.`
  }

  if (lowerQuery.includes('fertilizer') || lowerQuery.includes('nutrient')) {
    return `Sustainable nutrient management:

1. **Soil Testing**:
   - Get soil tested every 3 years
   - Tests reveal nitrogen, phosphorus, potassium, micronutrients

2. **NPK Application** (typical for major crops):
   - Nitrogen (N): 60-100 kg/hectare
   - Phosphorus (P): 30-60 kg/hectare
   - Potassium (K): 0-40 kg/hectare

3. **Organic Approaches**:
   - Green manuring: Use legumes
   - Vermicompost: 5-10 tons/hectare
   - Farm yard manure: 10-15 tons/hectare
   - Bio-fertilizers: Azospirillum, Phosphobacteria

4. **Application Timing**:
   - Half nitrogen before planting
   - Remaining nitrogen at flowering

Contact Government Agricultural Department for subsidized fertilizers and free soil testing.`
  }

  if (lowerQuery.includes('subsidy') || lowerQuery.includes('scheme')) {
    return `Available Government Support for Farmers:

1. **Prime Minister Kisan Samman Nidhi (PM-KISAN)**:
   - ₹6,000 per year in three installments
   - Direct bank transfer

2. **Crop Insurance - Pradhan Mantri Fasal Bima Yojana**:
   - Covers crop failure due to natural calamities
   - Premium: 1.5%-2% of sum insured

3. **Equipment Subsidy**:
   - Drip irrigation: 60-80% subsidy
   - Solar pumps: 50% subsidy
   - Farm machinery: 25-50% subsidy

4. **Credit Support**:
   - Kissan Credit Card at 4% interest
   - Renewable for 5 years

Register on your State Agriculture Department portal for updated schemes. Visit the nearest District Agricultural Office.`
  }

  // Default agricultural advice
  return `Here are general farming best practices for Indian agriculture:

1. **Soil Health**:
   - Conduct soil test every 3 years
   - Add organic matter regularly
   - Practice crop rotation

2. **Sustainable Practices**:
   - Use drip/sprinkler irrigation where possible
   - Adopt organic farming for premium prices
   - Use bio-fertilizers and neem-based pesticides

3. **Yield Improvement**:
   - Use high-quality certified seeds
   - Follow recommended spacing and timing
   - Monitor weather forecasts
   - Maintain farm records

4. **Market Access**:
   - Join farmer producer organizations (FPO)
   - Use government e-markets (eNAM)
   - Track commodity prices daily

5. **Government Support**:
   - Check PM-KISAN eligibility
   - Apply for crop insurance
   - Utilize extension services

Visit your local agricultural extension center for free personalized guidance.`
}

export default { queryAI, getChatHistory }
