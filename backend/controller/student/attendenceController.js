// backend/controllers/attendanceController.js
const axios      = require('axios');
const Attendance = require('../../model/attendanceModel/attendanceSchema.js');
const Geofence   = require('../../model/geofenceModel/geofenceSchema.js');
const Subject = require('../../model/subjectModel/subjectSchema.js')
const markAttendance = async (req, res) => {
  try {
    const { frames, image, lat, lng, subjectId, teacherId } = req.body;
    const studentId = req.user.id;
    

    console.log('\n=== MARK ATTENDANCE ===');
    console.log('Student:', studentId);

    // ── CHECK ATTENDANCE WINDOW IS OPEN ──────────────────
    const AttendanceWindow = require('../../model/attendanceModel/attendanceWindowSchema.js');
    const window = await AttendanceWindow.findOne({
      subject:   subjectId,
      isOpen:    true,
      expiresAt: { $gt: new Date() }
    });

    if (!window) {
      return res.status(403).json({
        success: false,
        message: 'Attendance window is closed. Ask your teacher to open it.',
        step:    'window'
      });
    }

    // Check student is enrolled in subject
    const subject = await Subject.findOne({
  _id:      subjectId,
  students: studentId
});

console.log('subjectId received:', subjectId);
console.log('studentId:', studentId);
console.log('subject found:', subject);

// if (!subject) {
//   return res.status(403).json({
//     success: false,
//     message: 'You are not enrolled in this subject'
//   });
// }

    // ── CHECK DUPLICATE ───────────────────────────────
    const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

const alreadyMarked = await Attendance.findOne({
  student: studentId,
  subject: subjectId,
  date: { $gte: startOfDay, $lte: endOfDay }
});
        console.log('Already marked:', alreadyMarked);
    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today'
      });
    }

    // ── STEP 1: LIVENESS ─────────────────────────────
    console.log('Step 1: Checking liveness...');

   let livenessResult;
try {
  const livenessRes = await axios.post(`${process.env.AI_SERVICE_URL}/liveness`, { frames });
  livenessResult = livenessRes.data;
} catch (err) {
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ success: false, message: 'AI service is not running on port 8000' });
  }
  console.error('Liveness call failed:', err.response?.data || err.message);
  return res.status(502).json({ success: false, message: 'AI service error during liveness check', step: 'liveness' });
}

    // ── STEP 2: FACE RECOGNITION ─────────────────────
    console.log('Step 2: Recognizing face...');

      const recognizeRes = await axios.post(
  `${process.env.AI_SERVICE_URL}/recognize`,
  { image },
  { validateStatus: () => true }  // don't throw on 401, handle it manually below
);
      const recognizeResult = recognizeRes.data;
      console.log('Recognition result:', recognizeResult);
  if (!recognizeResult.success) {
  return res.status(401).json({
    success: false,
    message: 'Face not recognized',
    step: 'recognition'
  });
}
  console.log('Recognized student ID:', recognizeResult.userId);
// Verify recognized face belongs to logged-in student
if (recognizeResult.userId !== studentId.toString()) {
  return res.status(403).json({
    success: false,
    message: 'Recognized face does not belong to logged-in student',
    step: 'recognition'
  });
}

    

    
      // if (err.code === 'ECONNREFUSED') {
      //   return res.status(503).json({
      //     success: false,
      //     message: 'AI service is not running on port 8000'
      //   });
      
      // throw err;

    

    // ── STEP 3: GEOFENCE ─────────────────────────────
    console.log('Step 3: Validating geofence...');

   const Geofence   = require('../../model/geofenceModel/geofenceSchema.js');
    const geofences  = await Geofence.find({ isActive: true });
    const geofenceRes = await axios.post(
      `${process.env.AI_SERVICE_URL}/geofence`,
      { userLat: lat, userLng: lng, geofences }
    );

    if (!geofenceRes.data.valid) {
      return res.status(403).json({
        success: false,
        message: geofenceRes.data.reason,
        step:    'geofence'
      });
    }

    // ── SAVE ATTENDANCE ──────────────────────────────
    console.log('All checks passed. Saving attendance...');

    const attendance = await Attendance.create({
      student:        studentId,
      subject:        subjectId,
      teacher:        subject.teacher,
        date: startOfDay,        // normalized, matches the index
         markedAt: new Date(),   
      faceConfidence: recognizeRes.data.confidence,
      livenessPass:   true,
      geofencePass:   true,
      location:       { lat, lng },
      status:         'present'
    });
     // Add student to window's marked list
    await AttendanceWindow.findByIdAndUpdate(
      window._id,
      { $addToSet: { markedStudents: studentId } }
    );

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data:    attendance
    });

    console.log('✅ Attendance saved:', attendance._id);

    // return res.status(201).json({
    //   success: true,
    //   message: 'Attendance marked successfully',
    //   data: {
    //     attendanceId: attendance._id,
    //     confidence: recognizeResult.confidence
    //   }
    // });

  }catch (error) {
    console.error('❌ Attendance error:', error.message);

     res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { markAttendance };