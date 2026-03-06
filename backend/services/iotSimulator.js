import WeatherLog from '../models/WeatherLog.model.js';
import SoilRecord from '../models/SoilRecord.model.js';
import WaterUsage from '../models/WaterUsage.model.js';
import HealthLog from '../models/HealthLog.model.js';
import Farm from '../models/Farm.model.js';
import User from '../models/User.model.js';

// IoT Simulator Service
// Generates realistic dummy data for weather, soil, water, and health metrics
// Updates periodically to simulate live sensor data

class IoTSimulator {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  async start() {
    if (this.isRunning) {
      console.log('IoT Simulator already running');
      return;
    }

    try {
      console.log('Starting IoT Simulator...');
      this.isRunning = true;

      // Initial data seeding
      await this.seedInitialData();

      // Start periodic updates every 2 minutes
      this.intervalId = setInterval(() => {
        this.updateAllSensorData();
      }, 2 * 60 * 1000);

      console.log('IoT Simulator started successfully');
    } catch (error) {
      console.error('Failed to start IoT Simulator:', error);
      this.isRunning = false;
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('IoT Simulator stopped');
  }

  async seedInitialData() {
    try {
      // Get all farms
      const farms = await Farm.find().limit(10);

      if (farms.length === 0) {
        console.log('No farms found to seed IoT data');
        return;
      }

      // Seed weather data
      for (const farm of farms) {
        await this.generateWeatherLog(farm._id);
        await this.generateSoilRecords(farm._id);
        await this.generateWaterLogs(farm._id);
      }

      // Seed health logs for users
      const users = await User.find({ role: 'farmer' }).limit(10);
      for (const user of users) {
        await this.generateHealthLog(user._id);
      }

      console.log('IoT data seeding completed');
    } catch (error) {
      console.error('Error seeding initial IoT data:', error);
    }
  }

  async updateAllSensorData() {
    try {
      const farms = await Farm.find();
      const users = await User.find({ role: 'farmer' });

      // Update weather data
      for (const farm of farms) {
        await this.generateWeatherLog(farm._id);
      }

      // Update health data
      for (const user of users) {
        // 50% chance to add new health log
        if (Math.random() < 0.5) {
          await this.generateHealthLog(user._id);
        }
      }

      console.log('IoT data updated at', new Date().toISOString());
    } catch (error) {
      console.error('Error updating sensor data:', error);
    }
  }

  async generateWeatherLog(farmId) {
    try {
      const temperature = 20 + Math.random() * 20; // 20-40°C
      const humidity = 30 + Math.random() * 60; // 30-90%
      const windSpeed = Math.random() * 25; // 0-25 km/h
      const uvIndex = Math.floor(Math.random() * 12); // 0-11

      const conditions = [
        'Clear',
        'Cloudy',
        'Rainy',
        'Partly Cloudy',
        'Sunny',
        'Overcast',
      ];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const rainfall = condition === 'Rainy' ? Math.random() * 50 : 0;

      const weatherLog = new WeatherLog({
        farm: farmId,
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity),
        rainfall: Math.round(rainfall * 10) / 10,
        windSpeed: Math.round(windSpeed * 10) / 10,
        uvIndex,
        condition,
        forecast: this.generateForecast(),
        plantingRecommendation: this.getPlantingRecommendation(temperature),
        alerts: this.generateWeatherAlerts(temperature, humidity, uvIndex),
        recordedAt: new Date(),
      });

      await weatherLog.save();
    } catch (error) {
      console.error('Error generating weather log:', error);
    }
  }

  generateForecast() {
    const forecast = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date,
        condition: ['Clear', 'Cloudy', 'Rainy', 'Sunny', 'Overcast'][
          Math.floor(Math.random() * 5)
        ],
        maxTemp: 20 + Math.random() * 20,
        minTemp: 12 + Math.random() * 10,
        rainChance: Math.floor(Math.random() * 100),
      });
    }
    return forecast;
  }

  getPlantingRecommendation(temperature) {
    if (temperature < 15) return 'Temperature is low. Consider protected cropping.';
    if (temperature > 35) return 'High temperature. Ensure adequate irrigation.';
    return 'Ideal temperature for most crops. Good for planting.';
  }

  generateWeatherAlerts(temperature, humidity, uvIndex) {
    const alerts = [];
    if (temperature > 35) {
      alerts.push('High temperature alert: Consider increased irrigation');
    }
    if (humidity < 30) {
      alerts.push('Low humidity: Watch for pest infestations');
    }
    if (uvIndex > 8) {
      alerts.push('High UV index: Increase sun protection measures');
    }
    return alerts;
  }

  async generateSoilRecords(farmId) {
    try {
      const soilRecord = new SoilRecord({
        farm: farmId,
        testDate: new Date(),
        pH: 6.0 + Math.random() * 1.5, // 6.0-7.5
        nitrogen: 200 + Math.random() * 100, // 200-300 ppm
        phosphorus: 20 + Math.random() * 30, // 20-50 ppm
        potassium: 150 + Math.random() * 100, // 150-250 ppm
        organicMatter: 2.0 + Math.random() * 2.0, // 2.0-4.0%
        moisture: 15 + Math.random() * 20, // 15-35%
        texture: ['loamy', 'clayey', 'sandy'][Math.floor(Math.random() * 3)],
        labReportUrl: 'https://example.com/report.pdf',
      });

      await soilRecord.save();
    } catch (error) {
      console.error('Error generating soil record:', error);
    }
  }

  async generateWaterLogs(farmId) {
    try {
      const farm = await Farm.findById(farmId);
      if (!farm) return;

      const waterUsed = 1000 + Math.random() * 5000; // 1000-6000 liters
      const duration = 30 + Math.random() * 90; // 30-120 minutes

      const waterLog = new WaterUsage({
        farm: farmId,
        date: new Date(),
        waterUsed: Math.round(waterUsed),
        irrigationMethod: ['drip', 'sprinkler', 'flood', 'micro'][
          Math.floor(Math.random() * 4)
        ],
        duration: Math.round(duration),
        source: ['borewell', 'canal', 'pond', 'rainwater'][
          Math.floor(Math.random() * 4)
        ],
        notes: ['Morning irrigation', 'Evening irrigation', 'Post-planting', 'Regular maintenance'][
          Math.floor(Math.random() * 4)
        ],
      });

      await waterLog.save();
    } catch (error) {
      console.error('Error generating water log:', error);
    }
  }

  async generateHealthLog(userId) {
    try {
      const healthLog = new HealthLog({
        user: userId,
        date: new Date(),
        workHours: 6 + Math.random() * 6, // 6-12 hours
        heatExposure: {
          duration: 60 + Math.random() * 180, // 1-4 hours
          uvIndex: Math.floor(Math.random() * 12),
          temperature: 20 + Math.random() * 20, // 20-40°C
        },
        waterIntake: 1.0 + Math.random() * 2.5, // 1-3.5 liters
        mood: ['good', 'average', 'fatigued', 'unwell'][
          Math.floor(Math.random() * 4)
        ],
        symptoms: this.generateSymptoms(),
        menstrualCycle: {
          phase: ['menstrual', 'follicular', 'ovulation', 'luteal'][
            Math.floor(Math.random() * 4)
          ],
          notes: '',
        },
      });

      await healthLog.save();
    } catch (error) {
      console.error('Error generating health log:', error);
    }
  }

  generateSymptoms() {
    const allSymptoms = [
      'headache',
      'fatigue',
      'muscle pain',
      'heat stress',
      'dehydration',
    ];
    const numSymptoms = Math.floor(Math.random() * 3);
    const symptoms = [];
    for (let i = 0; i < numSymptoms; i++) {
      symptoms.push(
        allSymptoms[Math.floor(Math.random() * allSymptoms.length)]
      );
    }
    return [...new Set(symptoms)]; // Remove duplicates
  }
}

// Create singleton instance
const iotSimulator = new IoTSimulator();

export default iotSimulator;
