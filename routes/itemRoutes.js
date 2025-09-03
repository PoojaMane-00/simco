const express = require('express');
const router = express.Router();
const controller = require('../controllers/itemController');

router.get('/', controller.getDashboard);
router.post('/items', controller.createItem);
router.put('/items/:id', controller.updateItem);
router.delete('/items/:id', controller.deleteItem);

module.exports = router;
