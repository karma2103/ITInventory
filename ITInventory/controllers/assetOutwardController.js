const express = require("express")
const app = express.Router()
const AssetOutward = require("../models/AssetOutward")

app.get("/AssetOutward", function (req, res) {
  res.render("pages/Assets/AssetOutward/Assetoutward")
})

app.post("/post", async (req, res) => {
  try {
    const data = new AssetOutward({
      date: req.body.date,
      serialNumber: req.body.serialNumber,
      particulars: req.body.particulars,
      assetDescription: req.body.assetDescription,
      assetSentTo: req.body.assetSentTo,
      authorizedBy: req.body.authorizedBy,
      remarks: req.body.remarks
    })
    const savedBackup = await data.save();
    req.flash("success", "Asset Outward Created Successfully")
    res.redirect("/viewAssets")
  } catch (error) {
    console.error("Error creating backup:", error)
    req.flash("error", "An error occurred while creating the Asset Outward.");
    res.status(500).json({ error: "An error occurred while creating the backup." })
  }
})

app.get("/viewAssets", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1 // Get current page from query parameter
    const perPage = 3 // Number of records per page
    const assets = await AssetOutward
      .find()
      .skip((page - 1) * perPage)
      .limit(perPage)

    const totalBackups = await AssetOutward.countDocuments()
    const totalPages = Math.ceil(totalBackups / perPage)
    res.render("pages/Assets/AssetOutward/viewAssetOutward", { assets, currentPage: page, totalPages })
  } catch (error) {
    console.error("Error fetching backups:", error)
    req.flash("error","Internal Server Error");
    res.status(500).send("Internal Server Error")
  }
})
//view the post
app.get("/viewAssets", async (req, res) => {
  try {
    const assets = await AssetOutward.find() // Fetch all backup records
    res.render("pages/Assets/AssetOutward/viewAssetOutward", { assets }) // Pass backups data to the EJS template
  } catch (error) {
    console.error("Error fetching backups:", error)
    res.status(500).send("Internal Server Error")
  }
})


app.get("/editAssetOutward/:id", async (req, res) => {
  try {
    const Outward = await AssetOutward.findById(req.params.id);

    if (!Outward) {
      req.flash("error","Asset Outward Not Found");
      return res.status(404).send("Asset Outward not found");

    }

    res.render("./pages/Assets/AssetOutward/editAssetOutward", { Outward });
  } catch (error) {
    console.error("Error fetching Asset Outward for edit:", error);
    req.flash("error", "Internal Server Error");
    res.status(500).send("Internal Server Error");
  }
});

app.post("/AssetUpdate/:id", async (req, res) => {
  try {
    const updatedAssetOutward = await AssetOutward.findByIdAndUpdate(
      req.params.id,
      {
        date: req.body.date,
        serialNumber: req.body.serialNumber,
        particulars: req.body.particulars,
        assetDescription: req.body.assetDescription,
        assetSentTo: req.body.assetSentTo,
        authorizedBy: req.body.authorizedBy,
        remarks: req.body.remarks
      },
      { new: true } // This option returns the updated document
    );

    if (!updatedAssetOutward) {
      return res.status(404).send("Asset Outward not found");
    }

    req.flash("success", "Asset Outward updated successfully");
    res.redirect("/viewAssets"); // Redirect to the view page after editing
  } catch (error) {
    console.error("Error updating Asset Outward:", error);
    req.flash("error", "An error occurred while updating the  Asset Outward.");
    res.status(500).send("Internal Server Error");
  }
});

//delete function 
app.delete("/assetout/:id", async (req, res) => {
  try {
    const Outward = await AssetOutward.findById(req.params.id);

    // Check if Asset OutWard exists
    if (!Outward) {
      req.flash("error", "Asset OutWard not found");
      return res.status(404).json({ success: false, message: "Asset OutWard not found" });
    }

    // Check if the Asset OutWard object is an instance of the Mongoose model
    if (!(Outward instanceof AssetOutward)) {
      req.flash("error", "Invalid Asset Outward object");
      return res.status(500).json({ success: false, message: "Invalid Asset Outward object" });
    }

    // Perform the actual deletion
    await Outward.deleteOne({ _id: req.params.id });

    req.flash("success", "Asset OutWard deleted successfully");
    res.json({ success: true, message: "Asset OutWard deleted successfully" });
  } catch (error) {
    console.error("Error deleting Asset OutWard:", error);
    req.flash("error", "An error occurred while deleting the Asset OutWard.");
    res.status(500).json({ success: false, message: "An error occurred while deleting the Asset OutWard." });
  }
});

module.exports = app
