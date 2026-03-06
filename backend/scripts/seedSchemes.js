import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import GovScheme from '../models/GovScheme.model.js'

const schemes = [
  {
    schemeName: 'PM-KISAN',
    department: 'Ministry of Agriculture',
    state: 'all',
    description: 'Pradhan Mantri Kisan Samman Nidhi',
    benefits: '₹6000/year direct income support in 3 installments',
    eligibility: ['Small and marginal farmers', 'Landholding up to 2 hectares'],
    applicationProcess: 'Online via pmkisan.gov.in or CSC centers',
    documents: ['Land records', 'Aadhaar', 'Bank account'],
    category: 'subsidy',
    isActive: true
  },
  {
    schemeName: 'PMFBY - Pradhan Mantri Fasal Bima Yojana',
    department: 'Ministry of Agriculture',
    state: 'all',
    description: 'Comprehensive crop insurance scheme',
    benefits: 'Crop insurance at 2% premium for Kharif, 1.5% for Rabi',
    eligibility: ['All farmers with insurable interest'],
    applicationProcess: 'Through CSC centers or partner insurance companies',
    documents: ['ID proof', 'Land records', 'Bank account'],
    category: 'insurance',
    isActive: true
  },
  {
    schemeName: 'Kisan Credit Card (KCC)',
    department: 'NABARD/RBI',
    state: 'all',
    description: 'Credit for crop production',
    benefits: 'Short-term loans up to ₹3 lakh at 4% interest rate for crop production',
    eligibility: ['Farmers with cultivable land'],
    applicationProcess: 'Apply through nearest bank',
    documents: ['Land certificate', 'ID proof', 'Income certificate'],
    category: 'loan',
    isActive: true
  },
  {
    schemeName: 'RKVY - Rashtriya Krishi Vikas Yojana',
    department: 'Ministry of Agriculture',
    state: 'all',
    description: 'Farm development and infrastructure support',
    benefits: 'Infrastructure grants for farm development and modernization',
    eligibility: ['Farmers implementing agriculture projects'],
    applicationProcess: 'Online application through state agriculture department',
    documents: ['Project proposal', 'Land records', 'Technical specifications'],
    category: 'subsidy',
    isActive: true
  },
  {
    schemeName: 'PM Krishi Sinchayee Yojana',
    department: 'Ministry of Jal Shakti',
    state: 'all',
    description: 'Irrigation infrastructure development',
    benefits: '55% subsidy on drip/sprinkler irrigation for women farmers, 45% for others',
    eligibility: ['Farmers with water sources', 'Women farmers priority'],
    applicationProcess: 'Apply through district agriculture office',
    documents: ['Land records', 'Water source details', 'Cost estimates'],
    category: 'equipment',
    isActive: true
  },
  {
    schemeName: 'Soil Health Card Scheme',
    department: 'Ministry of Agriculture',
    state: 'all',
    description: 'Free soil testing and recommendations',
    benefits: 'Free soil testing and recommendations every 2 years',
    eligibility: ['All farmers'],
    applicationProcess: 'Contact nearest soil testing lab',
    documents: ['ID proof', 'Land records'],
    category: 'other',
    isActive: true
  },
  {
    schemeName: 'eNAM - National Agriculture Market',
    department: 'SFAC',
    state: 'all',
    description: 'Online agricultural trading platform',
    link: 'https://www.enam.gov.in',
    benefits: 'Online trading platform for selling produce at better prices',
    eligibility: ['All farmers'],
    applicationProcess: 'Register on eNAM portal',
    documents: ['ID proof', 'Bank account'],
    category: 'other',
    isActive: true
  },
  {
    schemeName: 'NMSA - National Mission for Sustainable Agriculture',
    department: 'Ministry of Agriculture',
    state: 'all',
    description: 'Organic and climate-resilient farming support',
    benefits: 'Training and support for organic and climate-resilient farming',
    eligibility: ['All farmers interested in organic farming'],
    applicationProcess: 'Apply through state agriculture department',
    documents: ['Farm details', 'Interest declaration'],
    category: 'training',
    isActive: true
  },
  {
    schemeName: 'Mahila Kisan Sashaktikaran Pariyojana (MKSP)',
    department: 'Ministry of Agriculture',
    state: 'all',
    description: 'Exclusive empowerment program for women farmers',
    benefits: 'Training, resource support, collective farming, and market linkage',
    eligibility: ['Women farmers only', 'Age 18+'],
    applicationProcess: 'Through women SHGs or directly with ATMA',
    documents: ['ID proof', 'Land records', 'Bank account'],
    category: 'training',
    isActive: true
  },
  {
    schemeName: 'PKVY - Paramparagat Krishi Vikas Yojana',
    department: 'Ministry of Agriculture',
    state: 'all',
    description: 'Organic farming cluster development',
    benefits: '₹50,000/hectare for 3 years to promote organic farming clusters',
    eligibility: ['Farmers in cluster groups (10-50 farmers)'],
    applicationProcess: 'Through village level workers or ATMA',
    documents: ['Cluster formation certificate', 'Land records'],
    category: 'subsidy',
    isActive: true
  }
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('\n✅ Connected to MongoDB for seeding...\n')

    let inserted = 0
    let skipped = 0

    for (const scheme of schemes) {
      const exists = await GovScheme.findOne({ schemeName: scheme.schemeName })
      if (!exists) {
        await GovScheme.create(scheme)
        inserted++
        console.log(`✅ Inserted: ${scheme.schemeName}`)
      } else {
        skipped++
        console.log(`⏭️  Already exists: ${scheme.schemeName}`)
      }
    }

    console.log(`\n✅ Seeding complete!`)
    console.log(`   Inserted: ${inserted}, Skipped: ${skipped}\n`)

    await mongoose.connection.close()
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

seed()
