const mongoose = require('mongoose');

const AppointmentRecordSchema = new mongoose.Schema({
  apptDate: {
    type: Date,
    required: [true, 'Please add appointment date']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  dentist: {
    type: mongoose.Schema.ObjectId,
    ref: 'Dentist',
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'cancelled'],
    required: true
  },

  // กรณี completed: เก็บแค่รายละเอียดการรักษา (ตามที่คุณปรับ User Story)
  treatmentDetails: {
    type: String,
    required: function() { 
      return this.status === 'completed'; 
    }
  },

  // กรณี cancelled: เก็บเหตุผลที่ยกเลิก
  cancelReason: {
    type: String,
    required: function() { 
      return this.status === 'cancelled'; 
    }
  },

  // ข้อมูลอื่นๆ ที่อาจจะมี (เผื่อหมออยากโน้ตเพิ่มแต่ไม่บังคับ)
  notes: {
    type: String,
    default: ''
  }
}, 
{
  timestamps: true 
});

module.exports = mongoose.model('AppointmentRecord', AppointmentRecordSchema);