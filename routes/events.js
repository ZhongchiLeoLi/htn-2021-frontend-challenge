const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const events = require('../controllers/events');

router.route('/')
    .get(catchAsync(events.index))

router.route('/:id')
    .get(catchAsync(events.show))

module.exports = router;