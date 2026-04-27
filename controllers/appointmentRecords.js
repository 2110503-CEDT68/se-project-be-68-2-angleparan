const AppointmentRecord = require('../models/AppointmentRecord');
const moment = require('moment-timezone');

// @desc    Get all appointment records
// @route   GET /api/v1/records
// @access  Private
exports.getRecords = async (req, res, next) => {
  try {
    let findCondition = {};

    // 1. Role-based Scope
    if (req.user.role === 'user') {
      findCondition.user = req.user.id;
    } else if (req.user.role === 'dentist') {
      if (!req.user.dentistProfile) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      findCondition.dentist = req.user.dentistProfile;
    }

    // 2. Advanced Filters
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'startDate', 'endDate'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    const filters = JSON.parse(queryStr);

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

    // 4. Build Query
    let query = AppointmentRecord.find(findCondition).populate([
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
      query = query.sort('-createdAt'); // เรียงจากล่าสุดเป็นหลัก
    }

    // 5. Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await AppointmentRecord.countDocuments(findCondition);

    query = query.skip(startIndex).limit(limit);
    const records = await query;

    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
      success: true,
      count: records.length,
      pagination,
      data: records.map(record => ({
        ...record._doc,
        apptDate: moment(record.apptDate).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm"),
        createdAt: moment(record.createdAt).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm")
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Cannot find Records' });
  }
};

// @desc    Get single record
// @route   GET /api/v1/records/:id
// @access  Private
exports.getRecord = async (req, res, next) => {
  try {
    const record = await AppointmentRecord.findById(req.params.id).populate([
      { path: 'dentist', select: 'name experience expertise' },
      { path: 'user', select: 'name email phone' }
    ]);

    if (!record) {
      return res.status(404).json({ success: false, message: `No record found` });
    }

    res.status(200).json({
      success: true,
      data: {
        ...record._doc,
        apptDate: moment(record.apptDate).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm")
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Cannot find Record' });
  }
};

// @desc    Create new record (Manual insert for admin/system)
// @route   POST /api/v1/records
// @access  Private
exports.createRecord = async (req, res, next) => {
  try {
    const record = await AppointmentRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Cannot create Record' });
  }
};

// @desc    Update record
// @route   PUT /api/v1/records/:id
// @access  Private
exports.updateRecord = async (req, res, next) => {
  try {
    let record = await AppointmentRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: `No record found` });
    }

    // Role verification logic can be added here if needed (e.g. only admin or assigned dentist can edit details)

    record = await AppointmentRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Cannot update Record" });
  }
};

// @desc    Delete record
// @route   DELETE /api/v1/records/:id
// @access  Private
exports.deleteRecord = async (req, res, next) => {
  try {
    const record = await AppointmentRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: `No record found` });
    }

    // Optional: Only Admin can hard delete history records
    if (req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: `Not authorized to delete history records` });
    }

    await record.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Cannot delete Record" });
  }
};