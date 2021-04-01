const express = require('express');
const controller = require('../../controllers/customer.controller');

const router = express.Router();

router.route('/links').get(controller.searchLinks);
router.route('/emails').get(controller.searchEmailsByURL);
router.route('/linkedin').get(controller.searchLinkedInURLs);

module.exports = router;
