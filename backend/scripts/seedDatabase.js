import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

// Import models
import User from './models/User.model.js'
import Farm from './models/Farm.model.js'
import Crop from './models/Crop.model.js'
import GovScheme from './models/GovScheme.model.js'
import FinancialRecord from './models/FinancialRecord.model.js'
import BankAccount from './models/BankAccount.model.js'
import WeatherLog from './models/WeatherLog.model.js'
import MarketListing from './models/MarketListing.model.js'

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_monitoring')
    console.log('✓ Connected to MongoDB')

    // Check if data already exists
    const existingUsers = await User.countDocuments()
    if (existingUsers > 0) {
      console.log('✓ Database already seeded, skipping data creation')
      console.log(`  Found ${existingUsers} users`)
      const farmCount = await Farm.countDocuments()
      console.log(`  Found ${farmCount} farms`)
      const schemeCount = await GovScheme.countDocuments()
      console.log(`  Found ${schemeCount} schemes`)
      await mongoose.connection.close()
      return
    }

    // Create test farmer user
    console.log('\nCreating test users...')
    const testUser = await User.create({
      name: 'Raj Kumar',
      email: 'farmer@testfarm.com',
      phone: '91-9876543210',
      password: 'hashed_password_here', // Should be hashed in real app
      role: 'farmer',
      location: {
        state: 'Punjab',
        district: 'Ludhiana',
        city: 'Ludhiana'
      },
      farm_count: 1,
      isVerified: true
    })
    console.log(`✓ Created user: ${testUser.email}`)

    // Create test farm
    console.log('\nCreating test farm...')
    const testFarm = await Farm.create({
      owner: testUser._id,
      farmName: 'Green Valley Farm',
      location: {
        address: 'Near Market Road, Ludhiana',
        city: 'Ludhiana',
        state: 'Punjab',
        pincode: '141004',
        coordinates: {
          type: 'Point',
          coordinates: [75.9271, 30.9010] // Longitude, Latitude for Ludhiana
        }
      },
      size: 10,
      sizeUnit: 'acres',
      soilType: 'loamy',
      irrigationType: 'drip',
      crops: [],
      lastActivityDate: new Date()
    })
    testUser.farm_count = 1
    await testUser.save()
    console.log(`✓ Created farm: ${testFarm.farmName}`)

    // Create test crops
    console.log('\nCreating test crops...')
    const cropsData = [
      { cropName: 'Wheat', cropType: 'Cereal', season: 'Rabi', sowingDate: new Date('2024-10-01'), expectedHarvestDate: new Date('2025-03-01'), area: 4 },
      { cropName: 'Rice', cropType: 'Cereal', season: 'Kharif', sowingDate: new Date('2024-06-01'), expectedHarvestDate: new Date('2024-10-15'), area: 3 },
      { cropName: 'Cotton', cropType: 'Cash Crop', season: 'Kharif', sowingDate: new Date('2024-05-15'), expectedHarvestDate: new Date('2024-12-01'), area: 2 }
    ]

    const crops = []
    for (const cropData of cropsData) {
      const crop = await Crop.create({
        owner: testUser._id,
        farm: testFarm._id,
        ...cropData,
        status: 'active'
      })
      crops.push(crop)
      testFarm.crops.push(crop._id)
      console.log(`  ✓ Created crop: ${cropData.cropName}`)
    }
    await testFarm.save()

    // Create government schemes
    console.log('\nCreating government schemes...')
    const schemesData = [
      {
        schemeName: 'PM-KISAN',
        department: 'Ministry of Agriculture',
        state: 'All',
        description: 'Direct income support of ₹6,000 per year to all landholding farmers',
        benefits: 'Direct transfer of ₹6,000 annually in 3 equal installments',
        eligibility: 'All landholding farmers',
        category: 'Income Support',
        isActive: true
      },
      {
        schemeName: 'Pradhan Mantri Fasal Bima Yojana',
        department: 'Ministry of Agriculture',
        state: 'All',
        description: 'Comprehensive crop insurance coverage for all farmers',
        benefits: 'Coverage against crop failure, weather damage, and pest attacks',
        eligibility: 'All farmers growing notified crops',
        category: 'Insurance',
        isActive: true
      },
      {
        schemeName: 'Drip Irrigation Subsidy',
        department: 'State Agriculture Department',
        state: 'Punjab',
        description: 'Subsidized drip irrigation systems for efficient water usage',
        benefits: '50-60% subsidy on drip irrigation equipment',
        eligibility: 'Farmers with minimum 0.5 hectare farm',
        category: 'Equipment',
        isActive: true
      },
      {
        schemeName: 'Solar Pump Subsidy',
        department: 'Ministry of New and Renewable Energy',
        state: 'All',
        description: 'Subsidized solar pumps to reduce electricity costs',
        benefits: 'Up to 50% cost subsidy on solar pump installation',
        eligibility: 'Agricultural land owners',
        category: 'Energy',
        isActive: true
      },
      {
        schemeName: 'Kissan Credit Card',
        department: 'Banking Regulation',
        state: 'All',
        description: 'Easy credit facility at 4% interest for farming activities',
        eligibility: 'Registered farmers with land documents',
        benefits: 'Credit up to ₹3,00,000 at subsidized rates',
        category: 'Credit',
        isActive: true
      }
    ]

    for (const schemeData of schemesData) {
      const scheme = await GovScheme.create(schemeData)
      console.log(`  ✓ Created scheme: ${schemeData.schemeName}`)
    }

    // Create bank account
    console.log('\nCreating bank account...')
    const bankAccount = await BankAccount.create({
      user: testUser._id,
      bankName: 'State Bank of India',
      accountNumber: '1234567890123',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'Raj Kumar',
      accountType: 'savings',
      isVerified: true,
      isActive: true,
      metadata: {
        branchName: 'LDH Main Branch',
        state: 'Punjab',
        city: 'Ludhiana'
      }
    })
    console.log(`✓ Created bank account ending in ...${bankAccount.accountNumber.slice(-4)}`)

    // Create financial records
    console.log('\nCreating financial records...')
    const financialRecords = [
      {
        owner: testUser._id,
        farm: testFarm._id,
        crop: crops[0]._id,
        type: 'expense',
        amount: 25000,
        description: 'Wheat seeds and fertilizers',
        category: 'Input Cost'
      },
      {
        owner: testUser._id,
        farm: testFarm._id,
        crop: crops[0]._id,
        type: 'expense',
        amount: 15000,
        description: 'Labor and machinery rent',
        category: 'Labor'
      },
      {
        owner: testUser._id,
        farm: testFarm._id,
        crop: crops[1]._id,
        type: 'expense',
        amount: 30000,
        description: 'Rice cultivation cost',
        category: 'Input Cost'
      },
      {
        owner: testUser._id,
        farm: testFarm._id,
        type: 'subsidy',
        amount: 6000,
        description: 'PM-KISAN subsidy received',
        category: 'Government Support',
        status: 'credited',
        timeline: {
          initiated: new Date('2024-12-01'),
          processing: new Date('2024-12-05'),
          approved: new Date('2024-12-10'),
          transferred: new Date('2024-12-15'),
          credited: new Date('2024-12-20')
        }
      },
      {
        owner: testUser._id,
        farm: testFarm._id,
        type: 'income',
        amount: 120000,
        description: 'Wheat harvest sold at market',
        category: 'Crop Sale'
      }
    ]

    for (const recordData of financialRecords) {
      const record = await FinancialRecord.create({
        ...recordData,
        date: new Date(),
        currency: 'INR'
      })
      console.log(`  ✓ Created transaction: ${recordData.description}`)
    }

    // Create market listings (crops and equipment)
    console.log('\nCreating market listings...')
    const marketListings = [
      {
        seller: testUser._id,
        productName: 'Premium Wheat',
        category: 'grain',
        quantity: 500,
        unit: 'kg',
        pricePerUnit: 28,
        moq: 50,
        availableFrom: new Date(),
        isOrganic: false,
        transactionType: 'buy',
        status: 'available'
      },
      {
        seller: testUser._id,
        productName: 'Organic Tomatoes',
        category: 'vegetable',
        quantity: 100,
        unit: 'kg',
        pricePerUnit: 40,
        moq: 10,
        availableFrom: new Date(),
        isOrganic: true,
        transactionType: 'buy',
        status: 'available'
      },
      {
        seller: testUser._id,
        productName: 'Mahindra Tractor 575 DI',
        category: 'tractor',
        quantity: 1,
        unit: 'vehicle',
        pricePerUnit: 2500,
        moq: 1,
        availableFrom: new Date(),
        transactionType: 'rent',
        rentalPeriod: 'day',
        status: 'available'
      },
      {
        seller: testUser._id,
        productName: 'Drip Irrigation Kit',
        category: 'tool',
        quantity: 5,
        unit: 'kit',
        pricePerUnit: 12000,
        moq: 1,
        availableFrom: new Date(),
        transactionType: 'buy',
        status: 'available'
      }
    ]

    for (const listing of marketListings) {
      await MarketListing.create(listing)
    }
    console.log(`✓ Created ${marketListings.length} market listings`)

    // Create weather logs
    console.log('\nCreating weather data...')
    const weatherLogs = [
      {
        farm: testFarm._id,
        temperature: 25,
        feelsLike: 28,
        humidity: 65,
        rainfall: 1013,
        windSpeed: 12,
        uvIndex: 6,
        condition: 'Partly Cloudy',
        plantingRecommendation: 'Good conditions for sowing',
        alerts: []
      },
      {
        farm: testFarm._id,
        temperature: 32,
        feelsLike: 35,
        humidity: 55,
        rainfall: 1010,
        windSpeed: 15,
        uvIndex: 8,
        condition: 'Sunny',
        plantingRecommendation: 'Ensure proper irrigation',
        alerts: ['High temperature: Consider increasing irrigation']
      },
      {
        farm: testFarm._id,
        temperature: 18,
        feelsLike: 16,
        humidity: 75,
        rainfall: 1015,
        windSpeed: 8,
        uvIndex: 3,
        condition: 'Cloudy',
        plantingRecommendation: 'Ideal for most crops',
        alerts: []
      }
    ]

    for (const weatherData of weatherLogs) {
      await WeatherLog.create({
        ...weatherData,
        recordedAt: new Date()
      })
    }
    console.log(`✓ Created ${weatherLogs.length} weather logs`)

    console.log('\n✅ Database seeding completed successfully!')
    console.log('\nTest Account Credentials:')
    console.log('  Email: farmer@testfarm.com')
    console.log('  Password: password (set your own after login)')
    console.log(`\nTest Data:`)
    console.log(`  Farm: ${testFarm.farmName}`)
    console.log(`  Crops: ${crops.map(c => c.cropName).join(', ')}`)
    console.log(`  Bank: ${bankAccount.bankName}`)
    console.log(`  Listings: ${marketListings.length} active`)

  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
  }
}

// Run the seed function
seedDatabase()
