const Bulletin = require("../models/BulletinModel");
const fs = require("fs");
const path = require("path");
const { createNotification } = require('../controllers/NotificationController');
const asyncHandler = require("../utils/asyncHandler");
const EvacuationCenter = require("../models/EvacuationCenterModel")

// create bulletin    
exports.createBulletin = asyncHandler(async (req, res) => {
  const { title, body, evacuation_center_name } = req.body;

  if (!title || !body || !evacuation_center_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "An image is required for the bulletin" });
  }

  const uploadPath = path.join("uploads", Date.now() + "-" + req.file.originalname);
  fs.writeFileSync(uploadPath, req.file.buffer);

  await Bulletin.create({
    title,
    body,
    image: uploadPath.replace(/\\/g, "/"),
    evacuation_center_name
  });

  // create bulletin notification to evacuees
  try {
    await createNotification({
      title: `Announcement: ${title}`,
      body: body,
      recipient_id: req.query.center_id || null,
      recipient_role: 'Evacuee',
      meta: { evacuation_center_name }
    });
  } catch (err) {
    console.error('Failed to create bulletin notification:', err.message || err);
  }

  res.status(201).json({ message: "Bulletin news created successfully" });
});

// get all bulletins
exports.getAllBulletins = asyncHandler(async (req, res) => {
  const bulletins = await Bulletin.find().sort({ createdAt: -1 });
  res.json(bulletins);
});

// get bulletins by center name 
exports.getBulletinsByCenter = asyncHandler(async (req, res) => {
  const centerName = req.query.center_name;

  if (!centerName) {
    return res.status(400).json({ error: "Center name is required" });
  }

  const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const bulletins = await Bulletin.find({
    evacuation_center_name: { $regex: escapeRegex(centerName.trim()), $options: "i" }
  }).sort({ createdAt: -1 });
  
  res.json(bulletins);
});

// get bulletin by id
exports.getBulletinById = asyncHandler(async (req, res) => {
  const bulletin = await Bulletin.findById(req.params.id);
  if (!bulletin) return res.status(404).json({ error: "Bulletin news not found" });

  res.json(bulletin);
});

// update bulletin
exports.updateBulletin = asyncHandler(async (req, res) => {
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
});

// delete bulletin
exports.deleteBulletin = asyncHandler(async (req, res) => {
  const bulletin = await Bulletin.findByIdAndDelete(req.params.id);
  if (!bulletin) return res.status(404).json({ error: "Bulletin not found" });

  if (bulletin.image && fs.existsSync(bulletin.image)) {
    fs.unlinkSync(bulletin.image);
  }

  res.json({ message: "Bulletin news deleted successfully" });
});


// get bulletinn by center id
exports.getBulletinsByCenterId = asyncHandler(async (req, res) => {
  const { centerId } = req.params;

  if (!centerId) {
    return res.status(400).json({ error: "Evacuation center ID is required" });
  }

  const center = await EvacuationCenter.findById(centerId);
  if (!center) {
    return res.status(404).json({ error: "Evacuation center not found" });
  }

  const bulletins = await Bulletin.find({
    evacuation_center_name: { $regex: new RegExp(center.name, "i") }
  }).sort({ createdAt: -1 });

  return res.json(bulletins);
});