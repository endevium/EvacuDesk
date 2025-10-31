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

  res.status(201).json({ message: 'Stock record created successfully', stock: result.stock });
});

// get all stock of all evac center
exports.getAllStocks = asyncHandler(async (req, res) => {
  const stocks = await Stock.find().populate('evacuation_center_id');
  res.status(200).json(stocks);
});

// get stock by evac center id
exports.getStockByEvacCenterId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stock = await Stock.findOne({ evacuation_center_id: id }).populate('evacuation_center_id');

  if (!stock) {
    return res.status(404).json({ message: 'Stock record not found' });
  }

  res.status(200).json(stock);
});

// update stock quantity by category
exports.updateStock = asyncHandler(async (req, res) => {
  const { evacuation_center_id, itemType, amount, action } = req.body;

  if (
    !itemType ||
    !['Food Pack', 'Water Pack', 'Medicine Pack', 'Hygiene Pack', 'Clothing Pack', 'Bedding Pack', 'Infant Pack'].includes(itemType)
  ) {
    return res.status(400).json({ message: 'Invalid item type' });
  }

  const stock = await Stock.findOne({ evacuation_center_id });
  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }

  if (action === 'add') {
    stock.stocks[itemType] += amount;
  } else if (action === 'subtract') {
    if (stock.stocks[itemType] < amount) {
      return res.status(400).json({ message: `Insufficient ${itemType} stock.` });
    }
    // reduce
    stock.stocks[itemType] -= amount;
  } else {
    return res.status(400).json({ message: 'Invalid operation' });
  }

  await stock.save();
  res.status(200).json({ message: `${itemType} stock updated successfully` });
});

// distribute stock to evacuation center
exports.distributeStock = asyncHandler(async (req, res) => {
  const { evacCenterId, itemType, amount } = req.body;

  if (
    !itemType ||
    !['Food Pack', 'Water Pack', 'Medicine Pack', 'Hygiene Pack', 'Clothing Pack', 'Bedding Pack', 'Infant Pack'].includes(itemType)
  ) {
    return res.status(400).json({ message: 'Invalid item type' });
  }

  // main stock
  const adminStock = await Stock.findOne({ source: 'Admin' });
  if (!adminStock) {
    return res.status(404).json({ message: 'Main stock not found' });
  }

  // available stock quantity
  if (adminStock.stocks[itemType] < amount) {
    return res.status(400).json({ message: `Not enough ${itemType} stock` });
  }

  // reduce from main stock
  adminStock.stocks[itemType] -= amount;
  await adminStock.save();

  let evacStock = await Stock.findOne({ source: 'EvacuationCenter', evacuation_center_id: evacCenterId });
  if (!evacStock) {
    evacStock = new Stock({
      source: 'EvacuationCenter',
      evacuation_center_id: evacCenterId,
      stocks: {}
    });
  }

  evacStock.stocks[itemType] = (evacStock.stocks[itemType] || 0) + amount;
  await evacStock.save();

  res.status(200).json({ message: `Successfully distributed ${amount} ${itemType} to evacuation center` });
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
