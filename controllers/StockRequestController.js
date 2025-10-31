const StockRequest = require('../models/StockRequestModel');
const Stock = require('../models/StocksModel');
const EvacuationCenter = require('../models/EvacuationCenterModel');
const asyncHandler = require('../utils/asyncHandler');

// create stock request (evacuation center/staff)
exports.createStockRequest = asyncHandler(async (req, res) => {
    const { evacuation_center_id, ...rest } = req.body;

    // center exists
    const centerExist = await EvacuationCenter.findById(evacuation_center_id);
    if (!centerExist) return res.status(400).json({ message: 'Evacuation center not found' });

    const validItems = ['FoodPack', 'WaterPack', 'MedicinePack', 'HygienePack', 'ClothingPack', 'BeddingPack', 'InfantPack'];
    const stocks = {};
    let hasStock = false;

    for (const [item, qty] of Object.entries(rest)) {
        if (validItems.includes(item)) {
            stocks[item] = qty;
            if (qty > 0) hasStock = true;
        }
    }

    if (!hasStock) return res.status(400).json({ message: 'No stock items provided' });

    const request = new StockRequest({ evacuation_center_id, stocks });
    await request.save();

    res.status(201).json({ message: 'Stock request created successfully' });
});

// get all stock requests
exports.getAllStockRequests = asyncHandler(async (req, res) => {
    const requests = await StockRequest.find()
        .populate('evacuation_center_id', '-password -email_address');
    res.status(200).json(requests);
});

// get all stock requests by evac center id
exports.getStockRequestsByCenter = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const centerExist = await EvacuationCenter.findById(id);
    if (!centerExist) return res.status(400).json({ message: 'Evacuation center not found' });

    const requests = await StockRequest.find({ evacuation_center_id: id })
        .populate('evacuation_center_id', '-password -email_address');

    res.status(200).json(requests);
});

// update stock request status
exports.updateStockStatus = asyncHandler(async (req, res) => {
    const { request_id, status } = req.body; 

    const request = await StockRequest.findById(request_id);
    if (!request) return res.status(404).json({ message: 'Stock request not found' });

    if (request.status !== 'Pending' && status === 'Approved') {
        return res.status(400).json({ message: 'Request already processed' });
    }

    const adminStock = await Stock.findOne({ source: 'Admin' });
    if (!adminStock) return res.status(404).json({ message: 'Admin stock not found' });

    let centerStock = await Stock.findOne({ source: 'EvacuationCenter', evacuation_center_id: request.evacuation_center_id });
    if (!centerStock) {
        centerStock = new Stock({ source: 'EvacuationCenter', evacuation_center_id: request.evacuation_center_id, stocks: {} });
    }

    if (status === 'Approved') {
        // transfer stock from admin to center 
        for (const [item, qty] of Object.entries(request.stocks)) {
            if (adminStock.stocks[item] < qty) {
                return res.status(400).json({ message: `Not enough ${item} in Admin stock` });
            }
            adminStock.stocks[item] -= qty;
            centerStock.stocks[item] = (centerStock.stocks[item] || 0) + qty;
        }
    } else if (status !== 'Rejected' && status !== 'Received' && status !== 'Approved') {
        return res.status(400).json({ message: 'Invalid status' });
    }

    request.status = status;

    await adminStock.save();
    await centerStock.save();
    await request.save();

    res.status(200).json({ message: `Request ${status.toLowerCase()} successfully` });
});
