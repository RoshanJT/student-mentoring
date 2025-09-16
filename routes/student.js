const express = require('express');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Feedback = require('../models/Feedback');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get student profile and progress
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent meetings count
    const recentMeetings = await Meeting.countDocuments({
      studentId: req.userId,
      status: 'completed'
    });

    // Get upcoming meetings count
    const upcomingMeetings = await Meeting.countDocuments({
      studentId: req.userId,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'rescheduled'] }
    });

    // Get feedback count
    const feedbackCount = await Feedback.countDocuments({
      studentId: req.userId
    });

    res.json({
      user,
      stats: {
        recentMeetings,
        upcomingMeetings,
        feedbackCount
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update student profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, program, attendance, gpa, totalCredits, skills } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (program) updateData.program = program;
    if (attendance !== undefined) {
      if (attendance < 0 || attendance > 100) {
        return res.status(400).json({ message: 'Attendance must be between 0 and 100' });
      }
      updateData.attendance = attendance;
    }
    if (gpa !== undefined) {
      if (gpa < 0 || gpa > 4.0) {
        return res.status(400).json({ message: 'GPA must be between 0 and 4.0' });
      }
      updateData.gpa = gpa;
    }
    if (totalCredits !== undefined) {
      if (totalCredits < 0) {
        return res.status(400).json({ message: 'Total credits cannot be negative' });
      }
      updateData.totalCredits = totalCredits;
    }
    if (skills) {
      // Validate skills object
      const validSkills = ['communication', 'problemSolving', 'teamwork'];
      for (const [key, value] of Object.entries(skills)) {
        if (!validSkills.includes(key)) {
          return res.status(400).json({ message: `Invalid skill: ${key}` });
        }
        if (value < 0 || value > 100) {
          return res.status(400).json({ message: `${key} skill rating must be between 0 and 100` });
        }
      }
      updateData.skills = skills;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get student dashboard data
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get upcoming meetings
    const upcomingMeetings = await Meeting.find({
      studentId: req.userId,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'rescheduled'] }
    }).sort({ scheduledDate: 1 }).limit(5);

    // Get recent activity (completed meetings)
    const recentMeetings = await Meeting.find({
      studentId: req.userId,
      status: 'completed'
    }).sort({ scheduledDate: -1 }).limit(5);

    // Get recent feedback
    const recentFeedback = await Feedback.find({
      studentId: req.userId
    }).sort({ createdAt: -1 }).limit(3).select('-studentId');

    res.json({
      user,
      upcomingMeetings,
      recentMeetings,
      recentFeedback
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// Get student progress
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate progress metrics
    const totalMeetings = await Meeting.countDocuments({
      studentId: req.userId
    });

    const completedMeetings = await Meeting.countDocuments({
      studentId: req.userId,
      status: 'completed'
    });

    const totalFeedback = await Feedback.countDocuments({
      studentId: req.userId
    });

    const progressPercentage = totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0;

    res.json({
      user,
      progress: {
        totalMeetings,
        completedMeetings,
        totalFeedback,
        progressPercentage: Math.round(progressPercentage),
        attendance: user.attendance,
        gpa: user.gpa,
        skills: user.skills
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error fetching progress data' });
  }
});

module.exports = router;



