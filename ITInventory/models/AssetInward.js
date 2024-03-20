const mongoose = require("mongoose")

const AssetInwardSchema = new mongoose.Schema({
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
  suppiledBy: {
    type: String,
    required: true
  },
  receivedBy: {
    type: String,
    required: true
  },
  remarks: {
    type: String
  }
})

const AssetInward = mongoose.model("AssetInward", AssetInwardSchema)

module.exports = AssetInward
