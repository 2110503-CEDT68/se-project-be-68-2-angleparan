const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

router.use(protect);

router
  .route('/')
  .get(authorize('admin'), getUsers);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;