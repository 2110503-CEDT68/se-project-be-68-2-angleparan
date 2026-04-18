const express = require('express');
const {
  getAppointments,
  getAppointment,
  addAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointments');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getAppointments)
  .post(
    protect,
    authorize('admin', 'user'),
    addAppointment
  );

router
  .route('/:id')
  .get(protect,authorize('admin', 'dentist'), getAppointment)
  .put(
    protect,
    authorize('admin', 'user', 'dentist'),
    updateAppointment
  )
  .delete(
    protect,
    authorize('admin', 'user', 'dentist'),
    deleteAppointment
  );

module.exports = router;
