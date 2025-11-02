const Stock = require('../models/StocksModel');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// create initial stock record
const createStockRecord = async ({ source, evacuation_center_id }) => {
  let assignedCenterId = evacuation_center_id;

  if (source === 'Admin') {
    assignedCenterId = new mongoose.Types.ObjectId('000000000000000000000000');
  }

  const existing = await Stock.findOne({ source, evacuation_center_id: assignedCenterId });
  if (existing) {
    return { success: false, message: 'Stock record already exists' };
  }

  const stock = new Stock({
    source,
    evacuation_center_id: assignedCenterId,
    stocks: {
      FoodPack: 0,
      WaterPack: 0,
      MedicinePack: 0,
      HygienePack: 0,
      ClothingPack: 0,
      BeddingPack: 0,
      InfantPack: 0
    }
  });

  await stock.save();
  return { success: true, stock };
};

// create stock helper for create evac center
exports.createStock = asyncHandler(async (req, res) => {
  const { source, evacuation_center_id } = req.body;
  const result = await createStockRecord({ source, evacuation_center_id });

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  res.status(201).json({ message: 'Stock record created successfully' });
});

// get all stock of all evac center
exports.getAllStocks = asyncHandler(async (req, res) => {
  const stocks = await Stock.find({ source: "EvacuationCenter"}).populate({ path: 'evacuation_center_id', select: '-password -email_address -__v -role -createdAt -updatedAt' });
  res.status(200).json(stocks);
});

// get main Admin stock
exports.getAdminStock = asyncHandler(async (req, res) => {
  const adminStock = await Stock.findOne({ source: 'Admin' });

  if (!adminStock) {
    return res.status(404).json({ message: 'Admin stock not found' });
  }

  res.status(200).json(adminStock);
});

// get stock by evac center id
exports.getStockByEvacCenterId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stock = await Stock.findOne({ source: "EvacuationCenter", evacuation_center_id: id }).populate('evacuation_center_id');

  if (!stock) {
    return res.status(404).json({ message: 'Stock record not found' });
  }

  res.status(200).json(stock);
});

// update stock quantity (Admin-only)
exports.updateStock = asyncHandler(async (req, res) => {
  const { evacuation_center_id, action, ...rest } = req.body;

  if (!rest || Object.keys(rest).length === 0) {
    return res.status(400).json({ message: 'No stock items provided' });
  }

  const validItems = ['FoodPack', 'WaterPack', 'MedicinePack', 'HygienePack', 'ClothingPack', 'BeddingPack', 'InfantPack'];

  // admin main stock
  const adminStock = await Stock.findOne({ source: 'Admin' });
  if (!adminStock) return res.status(404).json({ message: 'Admin stock not found' });

  // center stock record
  let centerStock = await Stock.findOne({ source: 'EvacuationCenter', evacuation_center_id });
  if (!centerStock) {
    centerStock = new Stock({ source: 'EvacuationCenter', evacuation_center_id, stocks: {} });
  }

  for (const [itemType, amount] of Object.entries(rest)) {
    if (!validItems.includes(itemType)) {
      return res.status(400).json({ message: `Invalid item type: ${itemType}` });
    }

    const key = itemType.replace(/\s/g, '');

    // mdrrmo restock
    if (action === 'restock') {
      for (const [itemType, amount] of Object.entries(rest)) {
        if (!validItems.includes(itemType)) {
          return res.status(400).json({ message: `Invalid item type: ${itemType}` });
        }
        adminStock.stocks[itemType] = (adminStock.stocks[itemType] || 0) + amount;
      }

      await adminStock.save();
      return res.status(200).json({ message: 'Stock updated successfully' });
    }

    // restock stock
    if (action === 'add') {
      if (adminStock.stocks[key] < amount) {
        return res.status(400).json({ message: `Not enough ${itemType} in Admin stock` });
      }
      // subtract from admin stock & add to evac center stock
      adminStock.stocks[key] -= amount;
      centerStock.stocks[key] = (centerStock.stocks[key] || 0) + amount;
    } else if (action === 'subtract') {
      if (!centerStock.stocks[key] || centerStock.stocks[key] < amount) {
        return res.status(400).json({ message: `Insufficient ${itemType} stock at center` });
      }
      centerStock.stocks[key] -= amount;
      adminStock.stocks[key] = (adminStock.stocks[key] || 0) + amount;
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "add" or "subtract".' });
    }
  }

  await adminStock.save();
  await centerStock.save();
  res.status(200).json({ message: 'Stocks updated successfully' });
});

// // delete stock record
// exports.deleteStock = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const deleted = await Stock.findOneAndDelete({ evacuation_center_id: id });

//   if (!deleted) {
//     return res.status(404).json({ message: 'Stock record not found.' });
//   }

//   res.status(200).json({ message: 'Stock record deleted successfully.' });
// });

exports.createStockRecord = createStockRecord;
