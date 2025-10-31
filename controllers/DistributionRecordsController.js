const DistributionRecord = require('../models/DistributionRecordsModel');
const Evacuee = require('../models/EvacueeModel');
const EvacuationCenter = require('../models/EvacuationCenterModel');
const asyncHandler = require('../utils/asyncHandler');
const Stock = require('../models/StocksModel');

// distribute supplies to evacuee
exports.distributeSupplies = asyncHandler(async (req, res) => {
    const { evacuee_id, evacuation_center_id, stocks, distributed_by } = req.body;

    const evacueeExist = await Evacuee.findById(evacuee_id);
    if (!evacueeExist) {
      return res.status(400).json({ message: "Evacuee not found"})
    }

    const centerExist = await EvacuationCenter.findById(evacuation_center_id);
    if (!centerExist) {
      return res.status(400).json({ message: "Evacuation center not found"})
    }

    if (!stocks || Object.keys(stocks).length === 0) {
        return res.status(400).json({ message: 'No stock items provided' });
    }

    // evacuation center stock
    let centerStock = await Stock.findOne({ source: 'EvacuationCenter', evacuation_center_id });
    if (!centerStock) {
        return res.status(404).json({ message: 'Evacuation center stock not found' });
    }

    const validItems = ['FoodPack', 'WaterPack', 'MedicinePack', 'HygienePack', 'ClothingPack', 'BeddingPack', 'InfantPack'];

    // stock quantity/ distribution quantity comparison
    for (const [item, amount] of Object.entries(stocks)) {
        if (!validItems.includes(item)) {
            return res.status(400).json({ message: `Invalid stock item: ${item}` });
        }
        if (!centerStock.stocks[item] || centerStock.stocks[item] < amount) {
            return res.status(400).json({ message: `Insufficient ${item} stock at evacuation center` });
        }
    }

    // subtract onn the evacuation center stock
    for (const [item, amount] of Object.entries(stocks)) {
        centerStock.stocks[item] -= amount;
    }

    await centerStock.save();

    const distribution = new DistributionRecord({
        evacuee_id,
        evacuation_center_id,
        stocks,
        distributed_by,
        status: 'Distributed'
    });

    await distribution.save();

    res.status(201).json({ message: 'Supplies distributed successfully' });
});

// get distribution records for an evacuation center
exports.getCenterDistributions = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const distributions = await DistributionRecord.find({ evacuation_center_id: id })
        .populate('evacuee_id', '-password -email_address')
        .populate('evacuation_center_id', '-password -email_address');

    res.status(200).json(distributions);
});

// get distributions for a specific evacuee 
exports.getEvacueeDistributions = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const distributions = await DistributionRecord.find({ evacuee_id: id })
        .populate('evacuation_center_id', '-password -email_address');

    res.status(200).json(distributions);
});
