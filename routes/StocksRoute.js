const express = require('express');
const router = express.Router();
const StockController = require('../controllers/StocksController');

router.post('/', StockController.createStock);
router.get('/all', StockController.getAllStocks);
router.get('/:id', StockController.getStockByEvacCenterId);
router.patch('/update', StockController.updateStock);
router.get('/', StockController.getAdminStock);
// router.delete('/:id', StockController.deleteStock);

module.exports = router;
