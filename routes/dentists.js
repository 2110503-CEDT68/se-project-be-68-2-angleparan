const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const {
  getDentists,
  getDentist,
  getDentistAvailability,
  createDentist,
  updateDentist,
  deleteDentist
} = require('../controllers/dentists');

const ratingRoutes = require('./ratings');

// nested route
router.use('/:dentistId/ratings', ratingRoutes);
// include other resource routers
const appointmentRouter = require('./appointments');

// re-route into other resource routers
// /api/v1/dentists/:dentistId/appointments
router.use('/:dentistId/appointments', appointmentRouter);

router
  .route('/')
  .get(getDentists)
  .post(protect, authorize('admin'), createDentist);

router.route('/:id/availability').get(getDentistAvailability);

router
  .route('/:id')
  .get(getDentist)
  .put(protect, authorize('admin'), updateDentist)
  .delete(protect, authorize('admin'), deleteDentist);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Dentist:
 *       type: object
 *       required:
 *         - name
 *         - yearsOfExperience
 *         - areaOfExpertise
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the dentist
 *         name:
 *           type: string
 *           description: Dentist's name
 *         yearsOfExperience:
 *           type: number
 *           description: Years of experience
 *         areaOfExpertise:
 *           type: string
 *           description: Area of expertise
 *       example:
 *         id: 609bda561452242d88d36e37
 *         name: Dr. Smith
 *         yearsOfExperience: 10
 *         areaOfExpertise: Orthodontics
 */

/**
 * @swagger
 * tags:
 *   name: Dentists
 *   description: The dentists managing API
 */

/**
 * @swagger
 * /dentists:
 *   get:
 *     summary: Returns the list of all the dentists
 *     tags: [Dentists]
 *     responses:
 *       200:
 *         description: The list of the dentists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dentist'
 *   post:
 *     summary: Create a new dentist
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dentist'
 *     responses:
 *       201:
 *         description: The dentist was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dentist'
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /dentists/{id}/availability:
 *   get:
 *     summary: Get availability of a dentist
 *     tags: [Dentists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The dentist id
 *     responses:
 *       200:
 *         description: The dentist availability
 *       404:
 *         description: The dentist was not found
 */

/**
 * @swagger
 * /dentists/{id}:
 *   get:
 *     summary: Get the dentist by id
 *     tags: [Dentists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The dentist id
 *     responses:
 *       200:
 *         description: The dentist description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dentist'
 *       404:
 *         description: The dentist was not found
 *   put:
 *     summary: Update the dentist by the id
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The dentist id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dentist'
 *     responses:
 *       200:
 *         description: The dentist was updated
 *       404:
 *         description: The dentist was not found
 *   delete:
 *     summary: Remove the dentist by id
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The dentist id
 *     responses:
 *       200:
 *         description: The dentist was deleted
 *       404:
 *         description: The dentist was not found
 */


