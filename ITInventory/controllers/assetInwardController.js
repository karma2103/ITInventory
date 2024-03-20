const express = require("express")
const app = express.Router()
const assetInward = require("../models/AssetInward")

app.get("/AssetInward", function (req, res) {
  res.render("./pages/Assets/AssetInward/viewAssetInward")
})

app.post("/inwardsPost", async (req, res) => {
  try {
    
    const data = new assetInward({
      date: req.body.date,
      serialNumber: req.body.serialNumber,
      particulars: req.body.particulars,
      assetDescription: req.body.assetDescription,
      suppiledBy: req.body.suppiledBy,
      receivedBy: req.body.receivedBy,
      remarks: req.body.remarks
    })
    const savedBackup = await data.save();
    req.flash("success", "Asset Inward created successfully");
    res.redirect("/viewAssetsInward");
  } catch (error) {
    console.error("Error creating backup:", error);
    req.flash("error", "An error occurred while creating the Asset Inward.");
    res.status(500).json({ error: "An error occurred while creating the backup." })
  }
})

app.get("/viewAssetsInward", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1 // Get current page from query parameter
    const perPage = 3 // Number of records per page
    const assetsin = await assetInward
      .find()
      .skip((page - 1) * perPage)
      .limit(perPage)

    const totalBackups = await assetInward.countDocuments()
    const totalPages = Math.ceil(totalBackups / perPage)
    res.render("./pages/Assets/AssetInward/viewAssetInward", { assetsin, currentPage: page, totalPages })
  } catch (error) {
    console.error("Error fetching backups:", error)
    res.status(500).send("Internal Server Error")
  }
})
//view the post
app.get("/viewAssetsInward", async (req, res) => {
  try {
    const assetsin = await assetInward.find() // Fetch all backup records
    res.render("./pages/Assets/AssetInward/viewAssetInward", { assetsin }) // Pass backups data to the EJS template
  } catch (error) {
    console.error("Error fetching backups:", error)
    res.status(500).send("Internal Server Error")
  }
})

//edit asset inward 
app.get("/editAssetInward/:id", async (req, res) => {
  try {
    const Inward = await assetInward.findById(req.params.id);

    if (!Inward) {
      req.flash("error","Asset Inward Not Found");
      return res.status(404).send("Asset Inward not found");

    }

    res.render("./pages/Assets/AssetInward/editAssetInward", { Inward });
  } catch (error) {
    console.error("Error fetching Asset Inward for edit:", error);
    req.flash("error", "Internal Server Error");
    res.status(500).send("Internal Server Error");
  }
});

//Update the edit post 
app.post("/updateAssetInward/:id", async (req, res) => {
  try {
    const updateAssetInward = await assetInward.findByIdAndUpdate(
      req.params.id,
      {
        date: req.body.date,
        serialNumber: req.body.serialNumber,
        particulars: req.body.particulars,
        assetDescription: req.body.assetDescription,
        suppiledBy: req.body.suppiledBy,
        receivedBy: req.body.receivedBy,
        remarks: req.body.remarks
      },
      { new: true } // This option returns the updated document
    );

    if (!updateAssetInward) {
      return res.status(404).send("Asset Inward not found");
    }

    req.flash("success", "Asset Inward updated successfully");
    res.redirect("/viewAssetsInward"); // Redirect to the view page after editing
  } catch (error) {
    console.error("Error updating Asset Inward:", error);
    req.flash("error", "An error occurred while updating the  Asset Inward.");
    res.status(500).send("Internal Server Error");
  }
});

//delete records  
app.delete("/assetIn/:id", async (req, res) => {
  try {
    const Inward = await assetInward.findById(req.params.id);

    // Check if Asset Inward exists
    if (!Inward) {
      req.flash("error", "Asset Inward not found");
      return res.status(404).json({ success: false, message: "Asset Inward not found" });
    }

    // Check if the Asset Inward object is an instance of the Mongoose model
    if (!(Inward instanceof assetInward)) {
      req.flash("error", "Invalid Asset Inward object");
      return res.status(500).json({ success: false, message: "Invalid Asset Inward object" });
    }

    // Perform the actual deletion
    await Inward.deleteOne({ _id: req.params.id });

    req.flash("success", "Asset Inward Deleted Successfully");
    res.json({ success: true, message: "Asset Inward deleted successfully" });
  } catch (error) {
    console.error("Error deleting Asset Inward:", error);
    req.flash("error", "An error occurred while deleting the Asset Inward.");
    res.status(500).json({ success: false, message: "An error occurred while deleting the Asset Inward." });
  }
});
module.exports = app
