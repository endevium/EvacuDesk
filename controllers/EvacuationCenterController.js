const EvacuationCenter = require("../models/EvacuationCenterModel");
const fs = require("fs");
const path = require("path");
  
// create evacuation center
exports.createEvacuationCenter = async (req, res) => {
  try {
    // validations
    if (!req.file) {
      return res.status(400).json({ error: "A valid image is required" });
    }
    if (!req.body.name || !req.body.address || !req.body.capacity || !req.body.staff_name || !req.body.staff_contact_number) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existingCenter = await EvacuationCenter.findOne({ name: req.body.name });
    if (existingCenter) {
      return res.status(400).json({ error: "There is already an evacuation center with that name" });
    }
    // proceed
    const uploadPath = path.join("uploads", Date.now() + "-" + req.file.originalname);
    fs.writeFileSync(uploadPath, req.file.buffer);
    const center = await EvacuationCenter.create({
      ...req.body,
      image: uploadPath.replace(/\\/g, "/") 
    });
    res.status(201).json({ message: "Evacuation center created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get all evacuation centers
exports.getEvacuationCenters = async (req, res) => {
  try {
    const centers = await EvacuationCenter.find();
    res.json(centers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get evacuation center by id
exports.getEvacuationCenterById = async (req, res) => {
  try {
    const center = await EvacuationCenter.findById(req.params.id);
    if (!center) return res.status(404).json({ error: "Evacuation center not found" });
    res.json(center);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update evacuation center
exports.updateEvacuationCenter = async (req, res) => {
  try {
    // validation
    if (req.body.status) {
      delete req.body.status;
      return res.status(400).json({ error: "Invalid request" });
    }
    // proceed
    if (req.file) {
      const imagePath = path.join("uploads", Date.now() + "-" + req.file.originalname);
      fs.writeFileSync(imagePath, req.file.buffer);
      req.body.image = imagePath.replace(/\\/g, "/");
    }
    const center = await EvacuationCenter.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!center) return res.status(404).json({ error: "Evacuation center not found" });
    res.json({ message: "Evacuation center updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update evacuation center status 
exports.updateEvacuationCenterStatus = async (req, res) => {
  try {
    const center = await EvacuationCenter.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    );
    if (!center) return res.status(404).json({ error: "Evacuation center not found" });
    res.json({ message: "Evacuation center status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete evacuation center
exports.deleteEvacuationCenterById = async (req, res) => {
  try {
    const center = await EvacuationCenter.findByIdAndDelete(req.params.id);
    if (!center) return res.status(404).json({ error: "Evacuation center not found" });
    res.json({ message: "Evacuation center deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
