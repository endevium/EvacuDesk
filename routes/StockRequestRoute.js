const express = require('express');
const router = express.Router();
const StockRequestController = require('../controllers/StockRequestController');

router.post('/', StockRequestController.createStockRequest);
router.get('/', StockRequestController.getAllStockRequests);
router.get('/center/:id', StockRequestController.getStockRequestsByCenter); 
router.patch('/status', StockRequestController.updateStockStatus);

module.exports = router;
