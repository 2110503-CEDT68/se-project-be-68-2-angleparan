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

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       required:
 *         - score
 *         - dentist
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the rating
 *         score:
 *           type: number
 *           description: Rating score (e.g., 1-5)
 *         dentist:
 *           type: string
 *           description: Dentist id
 *         user:
 *           type: string
 *           description: User id
 */

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: The ratings managing API
 */

/**
 * @swagger
 * /ratings/summary:
 *   get:
 *     summary: Get ratings summary for all dentists
 *     tags: [Ratings]
 *     responses:
 *       200:
 *         description: Ratings summary retrieved successfully
 */

/**
 * @swagger
 * /dentists/{dentistId}/ratings:
 *   get:
 *     summary: Get all ratings of a specific dentist
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: dentistId
 *         schema:
 *           type: string
 *         required: true
 *         description: The dentist id
 *     responses:
 *       200:
 *         description: List of ratings retrieved
 *   post:
 *     summary: Add a rating for a dentist
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dentistId
 *         schema:
 *           type: string
 *         required: true
 *         description: The dentist id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rating'
 *     responses:
 *       201:
 *         description: Rating added successfully
 */

/**
 * @swagger
 * /ratings/{id}:
 *   put:
 *     summary: Update the rating by id
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The rating id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rating'
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *   delete:
 *     summary: Remove the rating by id
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The rating id
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 */
