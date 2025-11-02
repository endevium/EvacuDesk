const mongoose = require('mongoose');
const EvacueeRequest = require('../models/StockRequestModel');
const EvacuationCenter = require('../models/EvacuationCenterModel');
const EvacuationCenterOccupantsModel = require('../models/EvacuationCenterOccupantsModel');
const asyncHandler = require('../utils/asyncHandler');
const Stock = require('../models/StocksModel');
const Notification = require('../models/NotificationModel'); 
const DistributionRecord = require('../models/DistributionRecordsModel');
const EvacuationRegistration = require('../models/EvacuationRegistrationModel'); 

exports.getEvacueeDashboard = asyncHandler(async (req, res) => {
    const evacueeId = new mongoose.Types.ObjectId(req.params.id);

    // Check if evacuee is an occupant
    const occupantRecord = await EvacuationCenterOccupantsModel.findOne({ 
        evacuee_id: evacueeId,
        status: 'Active'
    }).populate('evacuation_center_id');

    const center = occupantRecord?.evacuation_center_id || null;

    // Past registrations
    const pastRegistrations = await EvacuationRegistration.countDocuments({
        evacuee_id: evacueeId
    });

    // Total relief items received
    const distributions = await DistributionRecord.find({
        evacuee_id: evacueeId,
        status: 'Distributed'
    });

    let totalReliefItems = 0;
    distributions.forEach((record) => {
        const { stocks } = record;
        totalReliefItems += Object.values(stocks || {}).reduce(
            (sum, val) => sum + (val || 0),
            0
        );
    });

    // Total notifications
    const totalNotifications = await Notification.countDocuments({
        recipient_id: evacueeId,
        recipient_role: 'Evacuee'
    });

    // Distributed packs per week
    const distributionPerWeekAgg = await DistributionRecord.aggregate([
        { $match: { evacuee_id: evacueeId, status: 'Distributed' } },
        {
            $group: {
                _id: {
                    weekStart: {
                        $dateTrunc: {
                            date: '$createdAt',
                            unit: 'week',
                            binSize: 1,
                            timezone: 'Asia/Manila'
                        }
                    }
                },
                FoodPack: { $sum: '$stocks.FoodPack' },
                WaterPack: { $sum: '$stocks.WaterPack' },
                MedicinePack: { $sum: '$stocks.MedicinePack' },
                HygienePack: { $sum: '$stocks.HygienePack' },
                ClothingPack: { $sum: '$stocks.ClothingPack' },
                BeddingPack: { $sum: '$stocks.BeddingPack' },
                InfantPack: { $sum: '$stocks.InfantPack' }
            }
        },
        { $sort: { '_id.weekStart': 1 } }
    ]);

    const DistributedPerWeek = {};
    distributionPerWeekAgg.forEach((stat) => {
        const start = new Date(stat._id.weekStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        const key = `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;

        DistributedPerWeek[key] = {
            FoodPack: stat.FoodPack || 0,
            WaterPack: stat.WaterPack || 0,
            MedicinePack: stat.MedicinePack || 0,
            HygienePack: stat.HygienePack || 0,
            ClothingPack: stat.ClothingPack || 0,
            BeddingPack: stat.BeddingPack || 0,
            InfantPack: stat.InfantPack || 0
        };
    });

    // Evacuation center slots info (only if assigned)
    let OccupiedSlots = null;
    let UnoccupiedSlots = null;

    if (center) {
        const totalCapacity = center.capacity || 0;
        const occupied = center.taken_slots || 0;
        const unoccupied = totalCapacity - occupied;

        OccupiedSlots = `${occupied} (${totalCapacity ? ((occupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;
        UnoccupiedSlots = `${unoccupied} (${totalCapacity ? ((unoccupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;
    }

    res.status(200).json({
        evacueeId,
        pastRegistrations,
        totalReliefItemsReceived: totalReliefItems,
        totalNotifications,
        DistributedPerWeek,
        OccupiedSlots,
        UnoccupiedSlots,
    });
});

// evacuation center dashboard
exports.getEvacuationCenterDashboard = asyncHandler(async (req, res) => {
    const centerId = new mongoose.Types.ObjectId(req.params.id);

    // active occupants
    const occupants = await EvacuationCenterOccupantsModel.find({
        evacuation_center_id: centerId,
        status: 'Active'
    });

    const totalOccupants = occupants.reduce((sum, occ) => sum + (occ.number_of_family_members || 1), 0);

    // get stock of the center
    const centerStock = await Stock.findOne({
        evacuation_center_id: centerId,
        source: 'EvacuationCenter'
    });

    // stock requests aggregation
    const StockRequest = require('../models/StockRequestModel');

    const requestsAgg = await StockRequest.aggregate([
        { $match: { evacuation_center_id: centerId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    let Pending = 0, Approved = 0, Rejected = 0, Received = 0;
    requestsAgg.forEach(stat => {
        switch (stat._id) {
            case "Pending": Pending = stat.count; break;
            case "Approved": Approved = stat.count; break;
            case "Rejected": Rejected = stat.count; break;
            case "Received": Received = stat.count; break;
        }
    });

    // requests per week aggregation
    const requestsPerWeekAgg = await StockRequest.aggregate([
        { $match: { evacuation_center_id: centerId } },
        {
            $group: {
                _id: {
                    weekStart: { $dateTrunc: { date: "$createdAt", unit: "week", binSize: 1, timezone: "Asia/Manila" } }
                },
                FoodPack: { $sum: "$stocks.FoodPack" },
                WaterPack: { $sum: "$stocks.WaterPack" },
                MedicinePack: { $sum: "$stocks.MedicinePack" },
                HygienePack: { $sum: "$stocks.HygienePack" },
                ClothingPack: { $sum: "$stocks.ClothingPack" },
                BeddingPack: { $sum: "$stocks.BeddingPack" },
                InfantPack: { $sum: "$stocks.InfantPack" }
            }
        },
        { $sort: { "_id.weekStart": 1 } }
    ]);

    const StockRequestsPerWeek = {};
    requestsPerWeekAgg.forEach(stat => {
        const start = new Date(stat._id.weekStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        const key = `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;

        StockRequestsPerWeek[key] = {
            FoodPack: stat.FoodPack || 0,
            WaterPack: stat.WaterPack || 0,
            MedicinePack: stat.MedicinePack || 0,
            HygienePack: stat.HygienePack || 0,
            ClothingPack: stat.ClothingPack || 0,
            BeddingPack: stat.BeddingPack || 0,
            InfantPack: stat.InfantPack || 0
        };
    });

    // evacuation center info
    const center = await EvacuationCenter.findById(centerId);
    if (!center) return res.status(404).json({ error: "Evacuation center not found" });

    const totalCapacity = center.capacity || 0;
    const occupied = totalOccupants;
    const unoccupied = totalCapacity - occupied;

    const OccupiedSlots = `${occupied} (${totalCapacity ? ((occupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;
    const UnoccupiedSlots = `${unoccupied} (${totalCapacity ? ((unoccupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;

    res.status(200).json({
        Pending,
        Approved,
        Rejected,
        Received,
        StockRequestsPerWeek,
        OccupiedSlots,
        UnoccupiedSlots,
        Stocks: centerStock ? centerStock.stocks : {}
    });
});

// admin dashboard 
exports.getAdminDashboard = asyncHandler(async (req, res) => {
    const adminStock = await Stock.findOne({ source: 'Admin' });

    // evacuation centers
    const centers = await EvacuationCenter.find({});
    const totalCapacity = centers.reduce((sum, c) => sum + (c.capacity || 0), 0);

    // total occupants 
    const occupants = await EvacuationCenterOccupantsModel.find({ status: 'Active' });
    const totalOccupied = occupants.reduce((sum, occ) => sum + (occ.number_of_family_members || 1), 0);
    const totalUnoccupied = totalCapacity - totalOccupied;

    const OccupiedSlots = `${totalOccupied} (${totalCapacity ? ((totalOccupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;
    const UnoccupiedSlots = `${totalUnoccupied} (${totalCapacity ? ((totalUnoccupied / totalCapacity) * 100).toFixed(2) : "0.00"}%)`;

    // stock requests from all centers
    const StockRequest = require('../models/StockRequestModel');
    const requestsAgg = await StockRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    let Pending = 0, Approved = 0, Rejected = 0, Received = 0;
    requestsAgg.forEach(stat => {
        switch (stat._id) {
            case "Pending": Pending = stat.count; break;
            case "Approved": Approved = stat.count; break;
            case "Rejected": Rejected = stat.count; break;
            case "Received": Received = stat.count; break;
        }
    });

    // requests per week aggregation (all centers)
    const requestsPerWeekAgg = await StockRequest.aggregate([
        {
            $group: {
                _id: {
                    weekStart: { $dateTrunc: { date: "$createdAt", unit: "week", binSize: 1, timezone: "Asia/Manila" } }
                },
                FoodPack: { $sum: "$stocks.FoodPack" },
                WaterPack: { $sum: "$stocks.WaterPack" },
                MedicinePack: { $sum: "$stocks.MedicinePack" },
                HygienePack: { $sum: "$stocks.HygienePack" },
                ClothingPack: { $sum: "$stocks.ClothingPack" },
                BeddingPack: { $sum: "$stocks.BeddingPack" },
                InfantPack: { $sum: "$stocks.InfantPack" }
            }
        },
        { $sort: { "_id.weekStart": 1 } }
    ]);

    const StockRequestsPerWeek = {};
    requestsPerWeekAgg.forEach(stat => {
        const start = new Date(stat._id.weekStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        const key = `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;
        StockRequestsPerWeek[key] = {
            FoodPack: stat.FoodPack || 0,
            WaterPack: stat.WaterPack || 0,
            MedicinePack: stat.MedicinePack || 0,
            HygienePack: stat.HygienePack || 0,
            ClothingPack: stat.ClothingPack || 0,
            BeddingPack: stat.BeddingPack || 0,
            InfantPack: stat.InfantPack || 0
        };
    });

    res.status(200).json({
        Pending,
        Approved,
        Rejected,
        Received,
        StockRequestsPerWeek,
        OccupiedSlots,
        UnoccupiedSlots,
        Stocks: adminStock ? adminStock.stocks : {}
    });
});
