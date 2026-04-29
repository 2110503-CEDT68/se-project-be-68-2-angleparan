const {
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointments");

const Appointment = require("../models/Appointment");
const AppointmentRecord = require("../models/AppointmentRecord");
const Dentist = require("../models/Dentist");

jest.mock("../models/Appointment");
jest.mock("../models/AppointmentRecord");
jest.mock("../models/Dentist");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

afterEach(() => jest.clearAllMocks());

/* =========================
   UPDATE APPOINTMENT TESTS
========================= */

describe("updateAppointment - FULL BRANCH COVERAGE", () => {

  test("❌ 404 - not found appointment", async () => {
    Appointment.findById = jest.fn().mockResolvedValue(null);

    const req = {
      params: { id: "1" },
      user: { role: "admin" },
      body: {}
    };

    const res = mockRes();

    await updateAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("❌ 401 - dentist not owner", async () => {
    Appointment.findById = jest.fn().mockResolvedValue({
      dentist: "D1",
      user: "U1"
    });

    const req = {
      params: { id: "1" },
      user: { role: "dentist", dentistProfile: "D2" },
      body: {}
    };

    const res = mockRes();

    await updateAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("❌ 401 - user not owner", async () => {
    Appointment.findById = jest.fn().mockResolvedValue({
      dentist: "D1",
      user: "U1"
    });

    const req = {
      params: { id: "1" },
      user: { role: "user", id: "U2" },
      body: {}
    };

    const res = mockRes();

    await updateAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("❌ 400 - completed but no treatmentDetails", async () => {
    Appointment.findById = jest.fn().mockResolvedValue({
      dentist: "D1",
      user: "U1",
      apptDate: new Date()
    });

    const req = {
      params: { id: "1" },
      user: { role: "admin" },
      body: { status: "completed" }
    };

    const res = mockRes();

    await updateAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("❌ 400 - cancelled but no cancelReason", async () => {
    Appointment.findById = jest.fn().mockResolvedValue({
      dentist: "D1",
      user: "U1",
      apptDate: new Date()
    });

    const req = {
      params: { id: "1" },
      user: { role: "admin" },
      body: { status: "cancelled" }
    };

    const res = mockRes();

    await updateAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("✅ completed -> create record + deleteOne (covers TRUE branch)", async () => {
    const deleteMock = jest.fn();

    Appointment.findById = jest.fn().mockResolvedValue({
      dentist: "D1",
      user: "U1",
      apptDate: new Date(),
      deleteOne: deleteMock
    });

    AppointmentRecord.create = jest.fn().mockResolvedValue({ id: "R1" });

    const req = {
      params: { id: "1" },
      user: { role: "admin" },
      body: {
        status: "completed",
        treatmentDetails: "done"
      }
    };

    const res = mockRes();

    await updateAppointment(req, res);

    expect(AppointmentRecord.create).toHaveBeenCalled();
    expect(deleteMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("✅ cancelled -> create record + deleteOne", async () => {
    const deleteMock = jest.fn();

    Appointment.findById = jest.fn().mockResolvedValue({
      dentist: "D1",
      user: "U1",
      apptDate: new Date(),
      deleteOne: deleteMock
    });

    AppointmentRecord.create = jest.fn().mockResolvedValue({});

    const req = {
      params: { id: "1" },
      user: { role: "admin" },
      body: {
        status: "cancelled",
        cancelReason: "no show"
      }
    };

    const res = mockRes();

    await updateAppointment(req, res);

    expect(deleteMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("❌ 400 - dentist not working hour", async () => {
    Appointment.findById = jest.fn().mockResolvedValue({
      dentist: "D1",
      user: "U1",
      apptDate: new Date()
    });

    Dentist.findById = jest.fn().mockResolvedValue({
      workingHours: { start: 10, end: 12 }
    });

    const req = {
      params: { id: "1" },
      user: { role: "admin" },
      body: {
        apptDate: new Date("2026-01-01T05:00:00Z")
      }
    };

    const res = mockRes();

    await updateAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("❌ 400 - slot already booked", async () => {
    Appointment.findById = jest.fn().mockResolvedValue({
      _id: "1",
      dentist: "D1",
      user: "U1",
      apptDate: new Date()
    });

    Dentist.findById = jest.fn().mockResolvedValue({
      workingHours: { start: 0, end: 23 }
    });

    Appointment.findOne = jest.fn().mockResolvedValue({ _id: "X" });

    const req = {
      params: { id: "1" },
      user: { role: "admin" },
      body: { apptDate: new Date() }
    };

    const res = mockRes();

    await updateAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("✅ normal update path (final else)", async () => {
    Appointment.findById = jest.fn().mockResolvedValue({
      _id: "1",
      dentist: "D1",
      user: "U1",
      apptDate: new Date()
    });

    Dentist.findById = jest.fn().mockResolvedValue({
      workingHours: { start: 0, end: 23 }
    });

    Appointment.findOne = jest.fn().mockResolvedValue(null);

    Appointment.findByIdAndUpdate = jest.fn().mockResolvedValue({
      _doc: {
        apptDate: new Date()
      },
      apptDate: new Date()
    });

    const req = {
      params: { id: "1" },
      user: { role: "admin" },
      body: { apptDate: new Date() }
    };

    const res = mockRes();

    await updateAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});


/* =========================
   DELETE APPOINTMENT TESTS
========================= */

describe("deleteAppointment - FULL BRANCH COVERAGE", () => {

  test("❌ 404 - not found", async () => {
    Appointment.findById = jest.fn().mockResolvedValue(null);

    const req = {
      params: { id: "1" },
      user: { id: "U1", role: "user" }
    };

    const res = mockRes();

    await deleteAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("❌ 401 - not owner or admin", async () => {
    Appointment.findById = jest.fn().mockResolvedValue({
      user: "U2",
      dentist: "D1"
    });

    const req = {
      params: { id: "1" },
      user: { id: "U1", role: "user" }
    };

    const res = mockRes();

    await deleteAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("✅ delete with custom reason", async () => {
    const deleteMock = jest.fn();

    Appointment.findById = jest.fn().mockResolvedValue({
      user: "U1",
      dentist: "D1",
      apptDate: new Date(),
      deleteOne: deleteMock
    });

    AppointmentRecord.create = jest.fn();

    const req = {
      params: { id: "1" },
      user: { id: "U1", role: "user" },
      body: { cancelReason: "user cancel" }
    };

    const res = mockRes();

    await deleteAppointment(req, res);

    expect(AppointmentRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cancelReason: "user cancel"
      })
    );

    expect(deleteMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("✅ delete with default reason", async () => {
    const deleteMock = jest.fn();

    Appointment.findById = jest.fn().mockResolvedValue({
      user: "U1",
      dentist: "D1",
      apptDate: new Date(),
      deleteOne: deleteMock
    });

    AppointmentRecord.create = jest.fn();

    const req = {
      params: { id: "1" },
      user: { id: "U1", role: "user" },
      body: {}
    };

    const res = mockRes();

    await deleteAppointment(req, res);

    expect(AppointmentRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cancelReason: "Deleted by user/system"
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("❌ 500 - catch block triggered (updateAppointment)", async () => {
  Appointment.findById = jest.fn().mockRejectedValue(new Error("DB crash"));

  const req = {
    params: { id: "1" },
    user: { role: "admin" },
    body: {}
  };

  const res = mockRes();

  await updateAppointment(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Cannot update Appointment"
    })
  );
});


test("❌ 500 - catch block triggered (deleteAppointment)", async () => {
  Appointment.findById = jest.fn().mockRejectedValue(new Error("DB crash"));

  const req = {
    params: { id: "1" },
    user: { id: "U1", role: "user" }
  };

  const res = mockRes();

  await deleteAppointment(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Cannot delete Appointment"
    })
  );
});



});
