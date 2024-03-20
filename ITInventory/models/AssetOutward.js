const mongoose = require("mongoose")

const AssetOutwardSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  particulars: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true
  },
  assetDescription: {
    type: String,
    required: true
  },
  assetSentTo: {
    type: String,
    required: true
  },
  authorizedBy: {
    type: String,
    required: true
  },
  remarks: {
    type: String
  }
})

const AssetOutward = mongoose.model("AssetOutward", AssetOutwardSchema)

module.exports = AssetOutward
