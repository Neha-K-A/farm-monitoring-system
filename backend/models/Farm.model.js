import mongoose from 'mongoose'

const farmSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    farmName: String,
    totalArea: {
      type: Number,
      required: true
    },
    areaUnit: {
      type: String,
      enum: ['acres','hectares','bigha'],
      default: 'acres'
    },
    location: {
      address: String,
      district: String,
      state: String,
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    farmMap: {
      geoJsonData: Object,
      mapImageUrl: String,
      plotDivisions: [{
        plotName: String,
        area: Number,
        currentCropId: mongoose.Schema.Types.ObjectId
      }]
    },
    irrigationSystem: {
      type: String,
      enum: ['drip','sprinkler','flood','rainfed','mixed','none']
    },
    soilType: {
      type: String,
      enum: ['clay','sandy','loamy','silty','peaty','chalky','mixed']
    },
    waterSource: {
      type: String,
      enum: ['well','borewell','canal','river','rainwater','mixed']
    },
    isOrganic: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

farmSchema.index({ owner: 1 })

export default mongoose.model('Farm', farmSchema)
