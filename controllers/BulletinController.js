const Bulletin = require("../models/BulletinModel");
const fs = require("fs");
const path = require("path");

// create bulletin
exports.createBulletin = async (req, res) => {
  try {
    const { is_public, title, body, evacuation_center_name, staff_name } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "An image is required for the bulletin" });
    }

    if (!req.body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const uploadPath = path.join("uploads", Date.now() + "-" + req.file.originalname);
    fs.writeFileSync(uploadPath, req.file.buffer);

    await Bulletin.create({
      is_public,
      title,
      body,
      image: uploadPath.replace(/\\/g, "/"),
      evacuation_center_name,
      staff_name
    });

    res.status(201).json({ message: "Bulletin news created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get all public bulletins news
exports.getPublicBulletins = async (req, res) => {
  try {
    const bulletins = await Bulletin.find({ is_public: true }).sort({ createdAt: -1 });
    res.status(200).json(bulletins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// // get bulletins by evacuation center name
// exports.getBulletinsByEvacuationCenter = async (req, res) => {
//   try {
//     const { evacuation_center_name } = req.params;
//     const bulletins = await BulletinBoard.find({ evacuation_center_name });
//     res.json(bulletins);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

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

    if (req.file) {

      const imagePath = path.join("uploads", Date.now() + "-" + req.file.originalname);
      fs.writeFileSync(imagePath, req.file.buffer);
      updateData.image = imagePath.replace(/\\/g, "/");
    }

    const bulletin = await Bulletin.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!bulletin) return res.status(404).json({ error: "Bulletin not found" });

    res.json({ message: "Bulletin news updated successfully", bulletin });
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
