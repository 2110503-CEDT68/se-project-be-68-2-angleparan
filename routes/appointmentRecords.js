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

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentRecord:
 *       type: object
 *       required:
 *         - appointment
 *         - recordDetails
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the record
 *         appointment:
 *           type: string
 *           description: Appointment id
 *         recordDetails:
 *           type: string
 *           description: Details of the record
 */

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: The appointment records managing API
 */

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Returns the list of all the appointment records
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AppointmentRecord'
 *   post:
 *     summary: Create a new appointment record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentRecord'
 *     responses:
 *       201:
 *         description: The record was successfully created
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get the record by id
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The record id
 *     responses:
 *       200:
 *         description: The record description by id
 *       404:
 *         description: The record was not found
 *   put:
 *     summary: Update the record by the id
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The record id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentRecord'
 *     responses:
 *       200:
 *         description: The record was updated
 *       404:
 *         description: The record was not found
 *   delete:
 *     summary: Remove the record by id
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The record id
 *     responses:
 *       200:
 *         description: The record was deleted
 *       404:
 *         description: The record was not found
 */
