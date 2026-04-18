const User = require('../models/User');
const Dentist = require('../models/Dentist');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate({
      path: 'dentistProfile',
      select: 'experience expertise workingHours'
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('dentistProfile');

    if (!user) {
      return res.status(404).json({ success: false, message: `No user found with id ${req.params.id}` });
    }

    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update user (พร้อม Sync ข้อมูลไปยังตาราง Dentist)
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: `No user found with id ${req.params.id}` });
    }

    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this user' });
    }

    const userFieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };
    
    Object.keys(userFieldsToUpdate).forEach(key => userFieldsToUpdate[key] === undefined && delete userFieldsToUpdate[key]);

    user = await User.findByIdAndUpdate(req.params.id, userFieldsToUpdate, {
      new: true,
      runValidators: true
    });

    if (user.role === 'dentist' && user.dentistProfile) {
      const dentistFieldsToUpdate = {};
      
      if (req.body.name) dentistFieldsToUpdate.name = req.body.name;
      
      if (req.body.experience !== undefined) dentistFieldsToUpdate.experience = req.body.experience;
      if (req.body.expertise) dentistFieldsToUpdate.expertise = req.body.expertise;
      if (req.body.workingHours) dentistFieldsToUpdate.workingHours = req.body.workingHours;

      if (Object.keys(dentistFieldsToUpdate).length > 0) {
        await Dentist.findByIdAndUpdate(user.dentistProfile, dentistFieldsToUpdate, {
          new: true,
          runValidators: true
        });
      }
    }

    const updatedUser = await User.findById(req.params.id).populate('dentistProfile');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: `No user found with id ${req.params.id}` });
    }

    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this user' });
    }

    // (Optional) ถ้าลบ User ที่เป็นหมอ จะลบโปรไฟล์หมอทิ้งด้วยไหม? 
    // ถ้าต้องการให้ Uncomment โค้ดด้านล่าง
    /*
    if (user.role === 'dentist' && user.dentistProfile) {
      await Dentist.findByIdAndDelete(user.dentistProfile);
    }
    */

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};