const express = require('express');
const os = require('os');
const si = require('systeminformation');
const Inventory = require('../../models/inventoryModel');
const app = express.Router();
const fs = require('fs');


// Endpoint to receive and store client information
app.post('/storeInfo', async (req, res) => {
    const clientInfo = req.body;

    try {
        // Insert the client information into the Server table
        const inventoryInstance = new Inventory(clientInfo);

        // Save the client information to the MongoDB collection
        await inventoryInstance.save();

        // console.log('Client information stored in Mongobd:', clientInfo);
        // res.render('./pages/Inventory/ViewCaptureDetails', { clientInfo })

        res.send('Information stored successfully!');
    } catch (error) {
        console.error('Error storing client information in Server:', error);
        res.status(500).send('Error storing information in Server.');
    }
});

// Endpoint to gather and send client information
app.get('/captureInfo', async (req, res) => {
    try {
        // Gather information about the client machine
        const name = await getName();
        // const ipAddress = await getIpAddress();  
        const ipAddress = req.ip; // Get client IP address from request headers
        const userAgent = req.headers['user-agent']; // Get user agent string
        const macAddress = await getMacAddress();
        const osInfo = await getOs();
        const deviceType = await getDeviceType();
        const processorData = await si.cpu();
        const processor = processorData.brand;
        const manufacturer = await si.system().then(data => data.manufacturer);
        const model = await si.system().then(data => data.model);
        const hostname = await si.osInfo().then(data => data.hostname);
        const serialNumber = await si.system().then(data => data.serial);
        const memory = await getInstalledMemory();
        const isHDDOrisSSD = await getStorageType();
        const storage = await getTotalStorage();
        

        // Construct the client information object
        const clientInfo = {
            userAgent,
            name,
            ipAddress,
            macAddress,
            osInfo,
            deviceType,
            processor,
            manufacturer,
            model,
            hostname,
            serialNumber,
            memory,
            isHDDOrisSSD,
            storage
        };

        // Send the information to your server
        
        const serverEndpoint = 'http://localhost:8080/storeInfo';
        await sendToServer(serverEndpoint, clientInfo);
        console.log(serverEndpoint, clientInfo);

        res.send('Information captured and sent successfully!');
        // res.redirect('ViewCaptureDetails');
    } catch (error) {
        console.error('Error capturing information:', error);
        res.status(500).send('Error capturing information.');
    }
    
});

// Function to get the name of the machine
function getName() {
    return si.osInfo().then(data => data.hostname);
}

// Function to get the IP address of the machine
function getIpAddress() {
    const networkInterfaces = os.networkInterfaces();
    const interfaceNames = Object.keys(networkInterfaces);

    for (const name of interfaceNames) {
        const interfaceInfo = networkInterfaces[name];

        for (const info of interfaceInfo) {
            if (!info.internal && info.family === 'IPv4') {
                return info.address;
            }
        }
    }

    return 'Unknown';
}

// Function to get the MAC address of the machine
function getMacAddress() {
    const networkInterfaces = os.networkInterfaces();
    const interfaceNames = Object.keys(networkInterfaces);

    for (const name of interfaceNames) {
        const interfaceInfo = networkInterfaces[name];

        for (const info of interfaceInfo) {
            if (!info.internal && info.mac !== '00:00:00:00:00:00') {
                return info.mac;
            }
        }
    }

    return 'Unknown';
}

// Function to get the OS of the machine
function getOs() {
    return si.osInfo().then(data => data.distro);
}

// Function to get the device type of the machine
function getDeviceType() {
    return si.system().then(data => data.model);
}

//function to get the memory 
async function getInstalledMemory() {
    // const memoryInfo = await si.mem();
    // const installedMemoryGB = memoryInfo.total / Math.pow(1024, 3);
    // return installedMemoryGB;
    const memLayout = await si.memLayout();
    let installedMemory = 0;

    memLayout.forEach(module => {
        installedMemory += module.size;
    });

    const installedMemoryGB = installedMemory / Math.pow(1024, 3);
    return installedMemoryGB;
}

//Function to get the Storage 
async function getTotalStorage(){
    try {
        const diskLayout = await si.diskLayout();
        // console.log('Disk Layout:', diskLayout);

        // First Check each disk for HDD or SSD
        const isHDD = diskLayout.some(disk => disk.type.toLowerCase() === 'hd');
        const isSSD = diskLayout.some(disk => disk.type.toLowerCase() === 'ssd');

        let storageSize;

        // Determine the storage size and convert the size into GB and convert with decimal 
        if (isHDD && isSSD) {
            const hddSize = parseInt(parseFloat(diskLayout.find(disk => disk.type.toLowerCase() === 'hd').size) / Math.pow(1024, 3));
            const ssdSize = parseInt(parseFloat(diskLayout.find(disk => disk.type.toLowerCase() === 'ssd').size) / Math.pow(1024, 3));
            storageSize = { hdd: hddSize, ssd: ssdSize };
        } else if (isHDD) {
            storageSize = parseInt(parseFloat(diskLayout.find(disk => disk.type.toLowerCase() === 'hd').size) / Math.pow(1024, 3));
        } else if (isSSD) {
            storageSize = parseInt(parseFloat(diskLayout.find(disk => disk.type.toLowerCase() === 'ssd').size) / Math.pow(1024, 3));
        } else {
            storageSize = 'N/A';
        }

        return storageSize;
    } catch (error) {
        console.error('Error getting storage size:', error);
        // Return a default value in case of error
        return 'N/A';
    }
}

//function to check if the storage is HDD or SSD
async function getStorageType() {
    try {
        const diskLayout = await si.diskLayout();
        // Check each disk for HDD or SSD
        const isHDD = diskLayout.some(disk => disk.type.toLowerCase() === 'hd');
        const isSSD = diskLayout.some(disk => disk.type.toLowerCase() === 'ssd');

        // Return the storage type based on the presence of HDD or SSD
        if (isHDD && isSSD) {
            return 'Hybrid'; 
        } else if (isHDD) {
            return 'HDD';
        } else if (isSSD) {
            return 'SSD';
        } else {
            return 'unknown';
        }
    } catch (error) {
        console.error('Error getting storage type:', error);
        throw error;
    }
}

// Function to send data to the server
async function sendToServer(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Server response: ${response.statusText}`);
        }

        console.log('Server response:', response.statusText);
    } catch (error) {
        throw new Error(`Error sending data to the server: ${error.message}`);
    }
}
//for Pagination 
app.get("/ViewCaptureDetails", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1 // Get current page from query parameter
      const perPage = 3 // Number of records per page
      const clientInfo = await Inventory
        .find()
        .skip((page - 1) * perPage)
        .limit(perPage)
  
      const totalinventory = await Inventory.countDocuments()
      const totalPages = Math.ceil(totalinventory / perPage)
      res.render("./pages/Inventory/ViewCaptureDetails", { clientInfo, currentPage: page, totalPages })
    } catch (error) {
      console.error("Error fetching Inventory:", error)
      req.flash("error","Internal Server Error");
      res.status(500).send("Internal Server Error")
    }
  })
//view 
app.get("/ViewCaptureDetails", async (req, res) => {
    try {
      const clientInfo = await Inventory.find() // 
      res.render("./pages/Inventory/ViewCaptureDetails", { clientInfo }) 
    } catch (error) {
      console.error("Error fetching backups:", error)
      res.status(500).send("Internal Server Error")
    }
  })

//function to read json data
function readCustodianData() {
    try {
        const rawData = fs.readFileSync('department.json');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading custodian data file:', error);
        return null;
    }
}

//Edit Function 
app.get("/editInventory/:id", async (req, res) => {
    try {
      const assetDetails = await Inventory.findById(req.params.id);
  
      if (!assetDetails) {
        req.flash("error","Inventory Not Found");
        return res.status(404).send("Inventory not found");
  
      }

     // Read custodian data from JSON file
      const custodianData = readCustodianData();
      res.render("./pages/Inventory/EditCaptureDetails", { assetDetails, custodianData });
    } catch (error) {
      console.error("Error fetching Asset Inventory for edit:", error);
      req.flash("error", "Internal Server Error");
      res.status(500).send("Internal Server Error");
    }
});

//Update the edit 
app.post("/updateInventory/:id", async (req, res) => {
    try {
        const {hdd, ssd } = req.body;
        const storageArray = [{ hdd: req.body.hdd, ssd: req.body.ssd }];

      const updateInventory = await Inventory.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          ipAddress: req.body.ipAddress,
          macAddress: req.body.particulars,
          osInfo: req.body.osInfo,
          deviceType: req.body.deviceType,
          manufacturer: req.body.manufacturer,
          model: req.body.model,
          hostname: req.body.hostname,
          model: req.body.model,
          serialNumber: req.body.serialNumber,
          storage: storageArray,
          memory: req.body.memory,
          isHDDOrisSSD: req.body.isHDDOrisSSD,
          custodian: req.body.custodian,
          department: req.body.department,
          placement: req.body.placement,
          dateofPurchase: req.body.dateofPurchase,
          dateofIssued: req.body.dateofIssued,
          equipIssuance: req.body.equipIssuance,
          empID: req.body.empID,
        },
        { new: true } 
      );
  
      if (!updateInventory) {
        return res.status(404).send("Inventory details not found");
      }
  
      req.flash("success", "Inventory Details updated successfully");
      res.redirect("/ViewCapturedetails"); // Redirect to the view page after editing
    } catch (error) {
      console.error("Error updating Inventory Details:", error);
      req.flash("error", "An error occurred while updating the  Inventory Details.");
      res.status(500).send("Internal Server Error");
    }
  });

//Delete IT Inventory from Data base 
app.delete('/DeletInventory/:id', async (req, res) =>{
    try{
        const assetdetails = await Inventory.findById(req.params.id);
        if(!assetdetails){
            req.flash("error", "Inventory not Found");
            return res.status(404).json({success: false, message: "Inventory Not Found"});
        }
        //check if inventory is an instance of mongoose model
        if(!(assetdetails instanceof Inventory)){
            req.flash("error", "invalid inventory object");
            return res.status(404).json({success: false, message: "Invalid inventory object"});
        }
        await Inventory.deleteOne({_id: req.params.id});
        req.flash("success", "Inventory Deleted Successfully");
        res.json({ success: true, message: "inventory Deleted successfully" });
    }catch (error){
        console.error("Error deleting Inventory:", error);
        req.flash("error", "An error occurred while deleting the Inventory.");
        res.status(500).json({ success: false, message: "An error occurred while deleting the inventory." });
    }
});
module.exports = app