const mongoose = require("mongoose")

const backupSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  server: {
    type: String,
    required: true
  },
  backupType: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    required: true
  },
  mediaSrNo: {
    type: String,
    required: true
  },
  backupLocation: {
    type: String,
    required: true
  },
  backupTakenBy: {
    type: String,
    required: true
  },
  remarks: {
    type: String
  }
})

const Backup = mongoose.model("Backup", backupSchema)

module.exports = Backup
