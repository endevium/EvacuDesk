const mongoose = require('mongoose');
const EvacueeRequest = require('../models/StockRequestModel');
const EvacuationCenter = require('../models/EvacuationCenterModel');
const EvacuationCenterOccupantsModel = require('../models/EvacuationCenterOccupantsModel');
const asyncHandler = require('../utils/asyncHandler');
const Stock = require('../models/StocksModel');

// evacuee dashboard
exports.getEvacueeDashboard = asyncHandler(async (req, res) => { 
    const evacueeId = new mongoose.Types.ObjectId(req.params.id);
    const occupantRecord = await EvacuationCenterOccupantsModel.findOne({ 
        evacuee_id: evacueeId,
        status: 'Active'
    }).populate('evacuation_center_id');

    if (!occupantRecord || !occupantRecord.evacuation_center_id) {
        return res.status(200).json({ message: "You are not assigned to any evacuation center." });
    }

    const center = occupantRecord.evacuation_center_id;

    // request status 
    const [pendingCount, fulfilledCount, rejectedCount] = await Promise.all([
        EvacueeRequest.countDocuments({ evacuee_id: evacueeId, status: 'Pending' }),
        EvacueeRequest.countDocuments({ evacuee_id: evacueeId, status: 'Fulfilled' }),
        EvacueeRequest.countDocuments({ evacuee_id: evacueeId, status: 'Rejected' })
    ]);

    // requests per week
    const requestsPerWeekAgg = await EvacueeRequest.aggregate([
        { $match: { evacuee_id: evacueeId } },
        {
            $group: {
                _id: { 
                    weekStart: { 
                        $dateTrunc: { date: "$createdAt", unit: "week", binSize: 1, timezone: "Asia/Manila" }
                    }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.weekStart": 1 } }
    ]);

    const RequestsPerWeek = {};
    requestsPerWeekAgg.forEach(stat => {
        const start = new Date(stat._id.weekStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const key = `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;
        RequestsPerWeek[key] = stat.count;
    });

    // evacuation center 
    const totalCapacity = center.capacity || 0;
    const occupied = center.taken_slots || 0;
    const unoccupied = totalCapacity - occupied;

    const OccupiedSlots = `${occupied} (${totalCapacity ? ((occupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;
    const UnoccupiedSlots = `${unoccupied} (${totalCapacity ? ((unoccupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;

    res.status(200).json({
        Pending: pendingCount,
        Fulfilled: fulfilledCount,
        Declined: rejectedCount,
        "RequestsPerWeek": RequestsPerWeek,
        OccupiedSlots,
        UnoccupiedSlots
    });
});

// evacuation center dashboard
exports.getEvacuationCenterDashboard = asyncHandler(async (req, res) => {
    const centerId = new mongoose.Types.ObjectId(req.params.id);    
    const occupants = await EvacuationCenterOccupantsModel.find({ 
        evacuation_center_id: centerId, 
        status: 'Active' 
    });

    // get stock of the center
    const centerStock = await Stock.findOne({
        evacuation_center_id: centerId,
        source: 'EvacuationCenter'
    });

    const totalOccupants = occupants.reduce((sum, occ) => sum + (occ.number_of_family_members || 1), 0);

    // requests
    const requestsAgg = await EvacueeRequest.aggregate([
        { $match: { evacuation_center_id: centerId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    let Pending = 0, Fulfilled = 0, Declined = 0;
    if (requestsAgg.length > 0) {
        requestsAgg.forEach(stat => {
            switch (stat._id) {
                case "Pending": Pending = stat.count; break;
                case "Fulfilled": Fulfilled = stat.count; break;
                case "Rejected": Declined = stat.count; break; 
            }
        });
    }

    // requests per week
    const requestsPerWeekAgg = await EvacueeRequest.aggregate([
        { $match: { evacuation_center_id: centerId } },
        {
            $group: {
                _id: { 
                    weekStart: { 
                        $dateTrunc: { date: "$createdAt", unit: "week", binSize: 1, timezone: "Asia/Manila" }
                    },
                    requestType: "$request_type"
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.weekStart": 1 } }
    ]);

    const RequestsPerWeek = {};
    requestsPerWeekAgg.forEach(stat => {
        const start = new Date(stat._id.weekStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // Week end
        const key = `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;

        if (!RequestsPerWeek[key]) {
            RequestsPerWeek[key] = { "Food": 0, "Water": 0, "Medicine": 0 };
        }

        if (stat._id.requestType in RequestsPerWeek[key]) {
            RequestsPerWeek[key][stat._id.requestType] += stat.count;
        }
    });

    const center = await EvacuationCenter.findById(centerId);
    if (!center) {
        return res.status(404).json({ error: "Evacuation center not found" });
    }

    // evacuation center 
    const totalCapacity = center.capacity || 0;
    const occupied = totalOccupants;
    const unoccupied = totalCapacity - occupied;

    const OccupiedSlots = `${occupied} (${totalCapacity ? ((occupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;
    const UnoccupiedSlots = `${unoccupied} (${totalCapacity ? ((unoccupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;

    res.status(200).json({
        Pending,
        Fulfilled,
        Declined,
        "RequestsPerWeek": RequestsPerWeek,
        OccupiedSlots,
        UnoccupiedSlots,
        Stocks: centerStock ? centerStock.stocks : {}
    });
});

// admin dashboard
exports.getAdminDashboard = asyncHandler(async (req, res) => {
    // main stock
    const adminStock = await Stock.findOne({ source: 'Admin' });
    // evacuation center 
    const centers = await EvacuationCenter.find({});
    const totalCapacity = centers.reduce((sum, c) => sum + (c.capacity || 0), 0);

    const occupants = await EvacuationCenterOccupantsModel.find({ status: 'Active' });
    const totalOccupied = occupants.reduce((sum, occ) => sum + (occ.number_of_family_members || 1), 0);
    const totalUnoccupied = totalCapacity - totalOccupied;

    const OccupiedSlots = `${totalOccupied} (${totalCapacity ? ((totalOccupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;
    const UnoccupiedSlots = `${totalUnoccupied} (${totalCapacity ? ((totalUnoccupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;

    // requests status
    const requestsAgg = await EvacueeRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    let Pending = 0, Fulfilled = 0, Declined = 0;
    requestsAgg.forEach(stat => {
        if (stat._id === "Pending") Pending = stat.count;
        if (stat._id === "Fulfilled") Fulfilled = stat.count;
        if (stat._id === "Rejected") Declined = stat.count;
    });

    const requestTypesAgg = await EvacueeRequest.aggregate([
        { $match: { status: "Fulfilled" } },
        { $group: { _id: "$request_type", count: { $sum: 1 } } }
    ]);

    let Food = 0, Water = 0, Medicine = 0;
    requestTypesAgg.forEach(stat => {
        if (stat._id === 'Food') Food = stat.count;
        if (stat._id === 'Water') Water = stat.count;
        if (stat._id === 'Medicine') Medicine = stat.count;
    });

    // requests per week
    const requestsPerWeekAgg = await EvacueeRequest.aggregate([
        {
            $group: {
                _id: {
                    weekStart: {
                        $dateTrunc: { date: "$createdAt", unit: "week", binSize: 1, timezone: "Asia/Manila" }
                    },
                    requestType: "$request_type"
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.weekStart": 1 } }
    ]);

    const RequestsPerWeek = {};
    requestsPerWeekAgg.forEach(stat => {
        const start = new Date(stat._id.weekStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const key = `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;

        if (!RequestsPerWeek[key]) {
            RequestsPerWeek[key] = { "Food": 0, "Water": 0, "Medicine": 0 };
        }

        if (stat._id.requestType in RequestsPerWeek[key]) {
            RequestsPerWeek[key][stat._id.requestType] += stat.count;
        }
    });

    res.status(200).json({
        Pending,
        Fulfilled,
        Declined,
        "RequestsPerWeek": RequestsPerWeek,
        OccupiedSlots,
        UnoccupiedSlots,
        Stocks: adminStock ? adminStock.stocks : {}
    });
});