const Appointment = require('../models/Appointment');
const AppointmentRecord = require('../models/AppointmentRecord'); // อย่าลืมสร้างและ import model นี้นะครับ
const Dentist = require('../models/Dentist');
const moment = require('moment-timezone');
<<<<<<< HEAD
const VALID_STATUSES = [ "confirmed", "cancelled", "completed"];
=======

const VALID_STATUSES = ["pending", "confirmed", "cancelled", "completed"];
>>>>>>> 92781c16be3b828090409ccc0e3177151cc869c6

// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    let findCondition = {};

    // 1. Role-based Scope (จำกัดขอบเขตข้อมูลตาม Role ก่อน)
    if (req.user.role === 'user') {
      findCondition.user = req.user.id;
    } else if (req.user.role === 'dentist') {
      if (!req.user.dentistProfile) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      findCondition.dentist = req.user.dentistProfile;
    }

    // 2. Advanced Query (อนุญาตให้ทุกคนใช้ Filter ได้)
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'startDate', 'endDate'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    const filters = JSON.parse(queryStr);

    // Merge conditions
    findCondition = { ...findCondition, ...filters };

    // 3. Date Filters
    if (req.query.apptDate) {
      const start = new Date(req.query.apptDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      findCondition.apptDate = { $gte: start, $lt: end };
    }

    if (req.query.startDate || req.query.endDate) {
      findCondition.apptDate = {};
      if (req.query.startDate) findCondition.apptDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) findCondition.apptDate.$lte = new Date(req.query.endDate);
    }

    // Nested route support
    if (req.params.dentistId) {
      findCondition.dentist = req.params.dentistId;
    }

    // 4. Build Query
    let query = Appointment.find(findCondition).populate([
      { path: 'dentist', select: 'name experience expertise' },
      { path: 'user', select: 'name email phone' }
    ]);

    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-apptDate');
    }

    // 5. Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Appointment.countDocuments(findCondition);

    query = query.skip(startIndex).limit(limit);
    const appointments = await query;

    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
      success: true,
      count: appointments.length,
      pagination,
      data: appointments.map(appt => ({
        ...appt._doc,
        apptDate: moment(appt.apptDate).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm")
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Cannot find Appointments' });
  }
};

// @desc    Get single appointment
// @route   GET /api/v1/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate([
      { path: 'dentist', select: 'name experience expertise' },
      { path: 'user', select: 'name email phone' }
    ]);

    if (!appointment) {
      return res.status(404).json({ success: false, message: `No appointment found` });
    }

    res.status(200).json({
      success: true,
      data: {
        ...appointment._doc,
        apptDate: moment(appointment.apptDate).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm")
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Cannot find Appointment' });
  }
};

// @desc    Add appointment
// @route   POST /api/v1/dentists/:dentistId/appointments
// @access  Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.dentist = req.params.dentistId;
    req.body.user = req.user.id;

    const dentist = await Dentist.findById(req.params.dentistId);
    if (!dentist) {
      return res.status(404).json({ success: false, message: `No dentist found` });
    }

    const apptDate = new Date(req.body.apptDate);
    const hour = moment(apptDate).tz("Asia/Bangkok").hour();

    // 1. Check working hours
    if (hour < dentist.workingHours.start || hour >= dentist.workingHours.end) {
      return res.status(400).json({ success: false, message: 'Dentist is unavailable at this time' });
    }

    // 2. Block ±1 hour window
    const windowStart = new Date(apptDate.getTime() - 60 * 60 * 1000);
    const windowEnd = new Date(apptDate.getTime() + 60 * 60 * 1000);
    const existedAppointment = await Appointment.findOne({
      dentist: req.params.dentistId,
      apptDate: { $gt: windowStart, $lt: windowEnd }
    });

    if (existedAppointment) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    // 3. User limit check (1 Active Appointment)
    if (req.user.role !== 'admin') {
      const existed = await Appointment.findOne({ user: req.user.id });
      if (existed) {
        return res.status(400).json({ success: false, message: 'You already have an active appointment' });
      }
    }

    const appointment = await Appointment.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        ...appointment._doc,
        apptDate: moment(appointment.apptDate).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm")
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Cannot create Appointment' });
  }
};

// @desc    Update appointment
// @route   PUT /api/v1/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: `No appointment found` });
    }

    // --- Permission Checks ---
    if (req.user.role === 'dentist') {
      const dentistProfileId = req.user.dentistProfile?.toString() || req.user.dentistProfile;
      if (!dentistProfileId || appointment.dentist.toString() !== dentistProfileId.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to update this appointment' });
      }
    } else if (req.user.role === 'user' && appointment.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    // --- Terminal Status Check: Move to AppointmentRecord ---
    const newStatus = req.body.status;
    if (newStatus === 'completed' || newStatus === 'cancelled') {
      if (newStatus === 'completed' && !req.body.treatmentDetails) {
        return res.status(400).json({ success: false, message: 'Please provide treatmentDetails for completed appointments' });
      }
      if (newStatus === 'cancelled' && !req.body.cancelReason) {
        return res.status(400).json({ success: false, message: 'Please provide cancelReason for cancelled appointments' });
      }

      // Create Record
      const record = await AppointmentRecord.create({
        apptDate: appointment.apptDate,
        user: appointment.user,
        dentist: appointment.dentist,
        status: newStatus,
        treatmentDetails: req.body.treatmentDetails,
        cancelReason: req.body.cancelReason,
        notes: req.body.notes || ''
      });

      // Delete from Active Queue
      await appointment.deleteOne();

      return res.status(200).json({
        success: true,
        message: `Appointment moved to records with status: ${newStatus}`,
        data: record
      });
    }

    // --- Normal Update Logic (If not moving to Record) ---
    if (req.body.apptDate) {
      const apptDate = new Date(req.body.apptDate);
      const hour = moment(apptDate).tz("Asia/Bangkok").hour();
      const targetDentistId = req.body.dentist || appointment.dentist;
      const dentist = await Dentist.findById(targetDentistId);

      if (hour < dentist.workingHours.start || hour >= dentist.workingHours.end) {
        return res.status(400).json({ success: false, message: 'Dentist is not working at this time' });
      }

      const windowStart = new Date(apptDate.getTime() - 60 * 60 * 1000);
      const windowEnd = new Date(apptDate.getTime() + 60 * 60 * 1000);
      const existedAppointment = await Appointment.findOne({
        dentist: targetDentistId,
        _id: { $ne: appointment._id },
        apptDate: { $gt: windowStart, $lt: windowEnd }
      });

      if (existedAppointment) {
        return res.status(400).json({ success: false, message: 'This time slot is already booked' });
      }
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });

    res.status(200).json({
      success: true,
      data: {
        ...appointment._doc,
        apptDate: moment(appointment.apptDate).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm")
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Cannot update Appointment" });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: `No appointment found` });
    }

    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: `Not authorized to delete this appointment` });
    }

    // --- Move to Record before deleting ---
    // ใช้ reason จาก body หรือค่า default หากไม่ได้แนบมา
    const reason = req.body.cancelReason || 'Deleted by user/system'; 
    
    await AppointmentRecord.create({
      apptDate: appointment.apptDate,
      user: appointment.user,
      dentist: appointment.dentist,
      status: 'cancelled',
      cancelReason: reason
    });

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Appointment deleted and moved to records as cancelled',
      data: {}
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Cannot delete Appointment" });
  }
};