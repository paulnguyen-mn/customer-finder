const express = require('express');
const controller = require('../../controllers/customer.controller');

const router = express.Router();

router.route('/links').get(controller.searchLinks);
router.route('/profiles').get(controller.searchProfiles);
router.route('/emails').get(controller.searchEmailsByURL);
router.route('/details').get(controller.getDetailsByURL);

module.exports = router;
