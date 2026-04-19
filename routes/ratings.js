const express = require('express');
const {
  addRating,
  getRatings,
  getRatingSummary,
  updateRating,
  deleteRating,
} = require('../controllers/ratings');

const { protect } = require('../middleware/auth');

// mergeParams: true → รับ :dentistId จาก parent router (/dentists/:dentistId/ratings)
const router = express.Router({ mergeParams: true });



// GET /api/v1/ratings/summary — summary ทุก dentist (ต้องอยู่ก่อน /:id)
router.get('/summary', getRatingSummary);

// Routes: /api/v1/dentists/:dentistId/ratings
router
  .route('/')
  .get(getRatings)           // Public — ดู rating ทั้งหมดของทันตแพทย์
  .post(protect, addRating); // Private — เพิ่ม rating (ต้อง login)

// Routes: /api/v1/ratings/:id
router
  .route('/:id')
  .put(protect, updateRating)    // Private — แก้ไข rating
  .delete(protect, deleteRating); // Private — ลบ rating

module.exports = router;

/*
 * วิธีเชื่อมกับ app.js หลัก:
 *
 * const ratings = require('./routes/ratings');
 *
 * // Re-route เข้า ratings router
 * app.use('/api/v1/dentists/:dentistId/ratings', ratings);
 * app.use('/api/v1/ratings', ratings);
 *
 * และใน dentists routes ให้เพิ่ม:
 * const router = express.Router();
 * router.use('/:dentistId/ratings', ratingsRouter);
 */
