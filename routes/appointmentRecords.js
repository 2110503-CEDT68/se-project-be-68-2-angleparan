const express = require('express');
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord
} = require('../controllers/appointmentRecords');

const { protect, authorize } = require('../middleware/auth');

// ใช้ mergeParams เผื่อในอนาคตต้องการทำ Nested Route (เช่น /dentists/:id/records)
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    protect, 
    getRecords
  )
  .post(
    protect,
    authorize('admin'),
    createRecord
  );

router
  .route('/:id')
  .get(
    protect, 
    getRecord
  )
  .put(
    protect,
    authorize('admin', 'dentist'), 
    updateRecord
  )
  .delete(
    protect,
    authorize('admin'),
    deleteRecord
  );

module.exports = router;