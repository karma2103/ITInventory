const express = require("express");
const router = express.Router();
const Backup = require("../models/backup");


router.get("/", function (req, res) {
  res.render("pages/index");
});

router.get("/BackupRegister", function (req, res) {
  res.render("./pages/BackupRegister");
});

router.post("/create", async (req, res) => {
  try {
    const data = new Backup({
      date: req.body.date,
      server: req.body.server,
      backupType: req.body.backupType,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      mediaType: req.body.mediaType,
      mediaSrNo: req.body.mediaSrNo,
      backupLocation: req.body.backupLocation,
      backupTakenBy: req.body.backupTakenBy,
      remarks: req.body.remarks,
    });
    const savedBackup = await data.save();
    req.flash("success", "Backup created successfully!");
    res.redirect("/backups");
  } catch (error) {
    console.error("Error creating backup:", error);
    req.flash("error", "An error occurred while creating the backup.");
    res.status(500).json({ error: "An error occurred while creating the backup." });
  }
});

//pagination
router.get("/backups", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get current page from query parameter
    const perPage = 3; // Number of records per page
    const backups = await Backup.find()
      .skip((page - 1) * perPage)
      .limit(perPage);

    const totalBackups = await Backup.countDocuments();
    const totalPages = Math.ceil(totalBackups / perPage);

    res.render("./pages/viewBackup", { backups, currentPage: page, totalPages });
  } catch (error) {
    console.error("Error fetching backups:", error);
    res.status(500).send("Internal Server Error");
  }
});

//view the post
router.get("/backups", async (req, res) => {
  try {
    const backups = await Backup.find(); // Fetch all backup records
    res.render("./pages/viewBackup", { backups }); // Pass backups data to the EJS template
  } catch (error) {
    console.error("Error fetching backups:", error);
    res.status(500).send("Internal Server Error");
  }
});

//edit 
router.get("/edit/:id", async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);

    if (!backup) {
      req.flash("error","Backup Not Found");
      return res.status(404).send("Backup not found");

    }

    res.render("./pages/Reports/editBackup", { backup });
  } catch (error) {
    console.error("Error fetching backup for edit:", error);
    req.flash("error", "Internal Server Error");
    res.status(500).send("Internal Server Error");
  }
});

router.post("/update/:id", async (req, res) => {
  try {
    const updatedBackup = await Backup.findByIdAndUpdate(
      req.params.id,
      {
        date: req.body.date,
        server: req.body.server,
        backupType: req.body.backupType,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        mediaType: req.body.mediaType,
        mediaSrNo: req.body.mediaSrNo,
        backupLocation: req.body.backupLocation,
        backupTakenBy: req.body.backupTakenBy,
        remarks: req.body.remarks,
      },
      { new: true } // This option returns the updated document
    );

    if (!updatedBackup) {
      return res.status(404).send("Backup not found");
    }

    req.flash("success", "Backup updated successfully");
    res.redirect("/backups"); // Redirect to the view page after editing
  } catch (error) {
    console.error("Error updating backup:", error);
    req.flash("error", "An error occurred while updating the backup.");
    res.status(500).send("Internal Server Error");
  }
});

//delete function 
router.delete("/delete/:id", async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);

    // Check if backup exists
    if (!backup) {
      req.flash("error", "Backup not found");
      return res.status(404).json({ success: false, message: "Backup not found" });
    }

    // Check if the backup object is an instance of the Mongoose model
    if (!(backup instanceof Backup)) {
      req.flash("error", "Invalid backup object");
      return res.status(500).json({ success: false, message: "Invalid backup object" });
    }

    // Perform the actual deletion
    await Backup.deleteOne({ _id: req.params.id });

    req.flash("success", "Backup deleted successfully");
    res.json({ success: true, message: "Backup deleted successfully" });
  } catch (error) {
    console.error("Error deleting backup:", error);
    req.flash("error", "An error occurred while deleting the backup.");
    res.status(500).json({ success: false, message: "An error occurred while deleting the backup." });
  }
});



module.exports = router;
