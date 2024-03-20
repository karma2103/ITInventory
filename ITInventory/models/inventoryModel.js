const mongoose = require("mongoose");

const inventoryModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    macAddress: {
        type: String,
        required: true
    },
    osInfo: {
        type: String,
        required: true
    },
    deviceType: {
        type: String,
        required: true
    },
    processor: {
        type: String,
        required: true
    },
    manufacturer: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true,
    },
    hostname: {
        type: String,
        required: true
    },
    serialNumber: {
        type: String,
        required: true,
    },
    memory: {
        type: String,
        required: true,
    },
    
    isHDDOrisSSD: {
        type: String,
        required:true,
    },
    storage: {
        hdd: { type: Number, default: null },
        ssd: { type: Number, default: null }
    },
    custodian:{
        type: String,
        default: null,
    },
    empID: {
        type: String,
        default: null,
    },
    department: {
        type: String,
        default: null,
    },
    placement: {
        type: String,
        default: null,
    },
    dateofPurchase: {
        type: Date,
        default: null,
    },
    equipIssuance: {
        type: String,
        default: null
    },
    dateofIssued: {
        type: Date,
        default: null
    }
});

const Inventory = mongoose.model("Inventory", inventoryModel);

module.exports = Inventory;
