const express = require('express');
const router = express.Router();
const { getAllAttributeValues } = require('../controller/attributeController');

router.get('/', getAllAttributeValues);

module.exports = router;