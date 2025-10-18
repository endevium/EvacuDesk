const Bulletin = require("../models/BulletinModel");
const fs = require("fs");
const path = require("path");

// create bulletin
exports.createBulletin = async (req, res) => {
  try {
    const { title, body, evacuation_center_name } = req.body;

    if (!title || !body || !evacuation_center_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "An image is required for the bulletin" });
    }

    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const uploadPath = path.join(uploadDir, Date.now() + "-" + req.file.originalname);
    fs.writeFileSync(uploadPath, req.file.buffer);

    await Bulletin.create({
      title,
      body,
      image: uploadPath.replace(/\\/g, "/"),
      evacuation_center_name
    });

    res.status(201).json({ message: "Bulletin news created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get all bulletins
exports.getAllBulletins = async (req, res) => {
  try {
    const bulletins = await Bulletin.find().sort({ createdAt: -1 });
    res.json(bulletins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get bulletins by center name 
exports.getBulletinsByCenter = async (req, res) => {
  try {
    const centerName = req.query.center_name;

    if (!centerName) {
      return res.status(400).json({ error: "Center name is required" });
    }

    const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const bulletins = await Bulletin.find({
      evacuation_center_name: { $regex: escapeRegex(centerName.trim()), $options: "i" }
    }).sort({ createdAt: -1 });
    
    if (!bulletins.length) {
      return res.status(404).json({ message: "No bulletins found for this center" });
    }

    res.json(bulletins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get bulletin by id
exports.getBulletinById = async (req, res) => {
  try {
    const bulletin = await Bulletin.findById(req.params.id);
    if (!bulletin) return res.status(404).json({ error: "Bulletin news not found" });

    res.json(bulletin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update bulletin
exports.updateBulletin = async (req, res) => {
  try {
    const updateData = { ...req.body };

    const bulletin = await Bulletin.findById(req.params.id);
    if (!bulletin) return res.status(404).json({ error: "Bulletin not found" });

    if (req.file) {
      if (bulletin.image && fs.existsSync(bulletin.image)) {
        fs.unlinkSync(bulletin.image);
      }

      const uploadDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

      const imagePath = path.join(uploadDir, Date.now() + "-" + req.file.originalname);
      fs.writeFileSync(imagePath, req.file.buffer);
      updateData.image = imagePath.replace(/\\/g, "/");
    }

    Object.assign(bulletin, updateData);
    await bulletin.save();

    res.json({ message: "Bulletin news updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// delete bulletin
exports.deleteBulletin = async (req, res) => {
  try {
    const bulletin = await Bulletin.findByIdAndDelete(req.params.id);
    if (!bulletin) return res.status(404).json({ error: "Bulletin not found" });

    if (bulletin.image && fs.existsSync(bulletin.image)) {
      fs.unlinkSync(bulletin.image);
    }

    res.json({ message: "Bulletin news deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


