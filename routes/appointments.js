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

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - apptDate
 *         - user
 *         - dentist
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the appointment
 *         apptDate:
 *           type: string
 *           format: date-time
 *           description: Appointment date
 *         user:
 *           type: string
 *           description: User id
 *         dentist:
 *           type: string
 *           description: Dentist id
 */

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: The appointments managing API
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Returns the list of all the appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: The appointment was successfully created
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get the appointment by id
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The appointment id
 *     responses:
 *       200:
 *         description: The appointment description by id
 *       404:
 *         description: The appointment was not found
 *   put:
 *     summary: Update the appointment by the id
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The appointment id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: The appointment was updated
 *       404:
 *         description: The appointment was not found
 *   delete:
 *     summary: Remove the appointment by id
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The appointment id
 *     responses:
 *       200:
 *         description: The appointment was deleted
 *       404:
 *         description: The appointment was not found
 */

