const express = require('express');
const controller = require('../../controllers/customer.controller');

const router = express.Router();

router.route('/test').get(controller.test);

module.exports = router;
