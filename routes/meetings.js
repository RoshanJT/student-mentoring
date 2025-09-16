const express = require('express');
const Meeting = require('../models/Meeting');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get all meetings for a student
router.get('/', verifyToken, async (req, res) => {
  try {
    const meetings = await Meeting.find({ studentId: req.userId })
      .sort({ scheduledDate: 1 });
    
    res.json({ meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Server error fetching meetings' });
  }
});

// Get upcoming meetings
router.get('/upcoming', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const meetings = await Meeting.find({
      studentId: req.userId,
      scheduledDate: { $gte: now },
      status: { $in: ['scheduled', 'rescheduled'] }
    }).sort({ scheduledDate: 1 });
    
    res.json({ meetings });
  } catch (error) {
    console.error('Get upcoming meetings error:', error);
    res.status(500).json({ message: 'Server error fetching upcoming meetings' });
  }
});

// Create new meeting
router.post('/', verifyToken, async (req, res) => {
  try {
    const { mentorName, topic, scheduledDate, scheduledTime, duration, location, notes } = req.body;

    // Validate required fields
    if (!mentorName || !topic || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ message: 'Mentor name, topic, scheduled date, and time are required' });
    }

    // Validate scheduled date is in the future
    const meetingDate = new Date(scheduledDate);
    if (meetingDate <= new Date()) {
      return res.status(400).json({ message: 'Meeting must be scheduled for a future date' });
    }

    // Validate duration
    if (duration && (duration < 15 || duration > 180)) {
      return res.status(400).json({ message: 'Duration must be between 15 and 180 minutes' });
    }

    const meeting = new Meeting({
      studentId: req.userId,
      mentorName: mentorName.trim(),
      topic: topic.trim(),
      scheduledDate: meetingDate,
      scheduledTime: scheduledTime.trim(),
      duration: duration || 60,
      location: location ? location.trim() : 'Online',
      notes: notes ? notes.trim() : ''
    });

    await meeting.save();

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Server error creating meeting' });
  }
});

// Update meeting (reschedule)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { mentorName, topic, scheduledDate, scheduledTime, duration, location, notes, status } = req.body;
    
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, studentId: req.userId },
      {
        mentorName,
        topic,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        scheduledTime,
        duration,
        location,
        notes,
        status: status || 'rescheduled'
      },
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({
      message: 'Meeting updated successfully',
      meeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ message: 'Server error updating meeting' });
  }
});

// Delete meeting
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      studentId: req.userId
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ message: 'Server error deleting meeting' });
  }
});

// Get meeting by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      studentId: req.userId
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({ meeting });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ message: 'Server error fetching meeting' });
  }
});

module.exports = router;



