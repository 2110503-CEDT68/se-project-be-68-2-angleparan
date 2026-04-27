const {
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointments');

const Appointment = require('../models/Appointment');
const AppointmentRecord = require('../models/AppointmentRecord');
const Dentist = require('../models/Dentist');

jest.mock('../models/Appointment');
jest.mock('../models/AppointmentRecord');
jest.mock('../models/Dentist');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Appointment Status Tests', () => {

  let req, res;

  beforeEach(() => {
    req = {
      params: { id: '123' },
      body: {},
      user: { id: 'user1', role: 'user' }
    };
    res = mockRes();
    jest.clearAllMocks();
  });

  // ============================
  // ✅ COMPLETED
  // ============================
  describe('status = completed', () => {

    it('should move to record when completed with treatmentDetails', async () => {
      const mockAppt = {
        _id: '123',
        apptDate: new Date(),
        user: 'user1',
        dentist: 'dentist1',
        deleteOne: jest.fn()
      };

      Appointment.findById.mockResolvedValue(mockAppt);
      AppointmentRecord.create.mockResolvedValue({ status: 'completed' });

      req.body = {
        status: 'completed',
        treatmentDetails: 'ถอนฟัน'
      };

      await updateAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(AppointmentRecord.create).toHaveBeenCalled();
      expect(mockAppt.deleteOne).toHaveBeenCalled();
    });

    it('should fail if no treatmentDetails', async () => {
      Appointment.findById.mockResolvedValue({
        _id: '123',
        user: 'user1',
        dentist: 'dentist1'
      });

      req.body = { status: 'completed' };

      await updateAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ============================
  // ❌ CANCELLED
  // ============================
  describe('status = cancelled', () => {

    it('should move to record when cancelled with reason', async () => {
      const mockAppt = {
        _id: '123',
        apptDate: new Date(),
        user: 'user1',
        dentist: 'dentist1',
        deleteOne: jest.fn()
      };

      Appointment.findById.mockResolvedValue(mockAppt);
      AppointmentRecord.create.mockResolvedValue({ status: 'cancelled' });

      req.body = {
        status: 'cancelled',
        cancelReason: 'ติดธุระ'
      };

      await updateAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(AppointmentRecord.create).toHaveBeenCalled();
      expect(mockAppt.deleteOne).toHaveBeenCalled();
    });

    it('should fail if no cancelReason', async () => {
      Appointment.findById.mockResolvedValue({
        _id: '123',
        user: 'user1',
        dentist: 'dentist1'
      });

      req.body = { status: 'cancelled' };

      await updateAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ============================
  // 🔁 NORMAL STATUS (pending / confirmed)
  // ============================
  describe('status = pending / confirmed', () => {

    it('should update normally without creating record', async () => {
      const mockAppt = {
        _id: '123',
        user: 'user1',
        dentist: 'dentist1'
      };

      Appointment.findById.mockResolvedValue(mockAppt);

      Appointment.findByIdAndUpdate.mockResolvedValue({
        _doc: { apptDate: new Date() }
      });

      req.body = { status: 'confirmed' };

      await updateAppointment(req, res);

      expect(AppointmentRecord.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ============================
  // 🔒 PERMISSION
  // ============================
  describe('permission', () => {

    it('should fail if user not owner', async () => {
      Appointment.findById.mockResolvedValue({
        _id: '123',
        user: 'anotherUser',
        dentist: 'dentist1'
      });

      await updateAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // ============================
  // 🗑 DELETE → CANCELLED
  // ============================
  describe('deleteAppointment', () => {

    it('should move to record with cancelled status', async () => {
      const mockAppt = {
        _id: '123',
        apptDate: new Date(),
        user: 'user1',
        dentist: 'dentist1',
        deleteOne: jest.fn()
      };

      Appointment.findById.mockResolvedValue(mockAppt);

      await deleteAppointment(req, res);

      expect(AppointmentRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'cancelled'
        })
      );

      expect(mockAppt.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fail if not owner', async () => {
      Appointment.findById.mockResolvedValue({
        _id: '123',
        user: 'anotherUser',
        dentist: 'dentist1'
      });

      await deleteAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

});
