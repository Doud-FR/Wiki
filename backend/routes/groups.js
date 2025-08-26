const express = require('express');
const { body, validationResult } = require('express-validator');
const { Group, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all groups
router.get('/', authMiddleware, async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [
        {
          model: User,
          through: { attributes: [] }, // Don't include join table attributes
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const groupsWithMemberCount = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group.Users.length,
      createdAt: group.createdAt,
      isActive: group.isActive,
      members: group.Users
    }));

    res.json(groupsWithMemberCount);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Create group
router.post('/', authMiddleware, [
  body('name').notEmpty().withMessage('Group name required'),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    // Check if group name already exists
    const existingGroup = await Group.findOne({ where: { name } });
    if (existingGroup) {
      return res.status(400).json({ error: 'Group name already exists' });
    }

    const group = await Group.create({
      name,
      description: description || ''
    });

    res.status(201).json({
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: 0,
      createdAt: group.createdAt,
      isActive: group.isActive
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get group by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        {
          model: User,
          through: { attributes: [] },
          attributes: ['id', 'firstName', 'lastName', 'email', 'isActive']
        }
      ]
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      id: group.id,
      name: group.name,
      description: group.description,
      isActive: group.isActive,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      members: group.Users
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Update group
router.put('/:id', authMiddleware, [
  body('name').optional().notEmpty().withMessage('Group name cannot be empty'),
  body('description').optional(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const { name, description, isActive } = req.body;

    // Check if new name already exists (if name is being changed)
    if (name && name !== group.name) {
      const existingGroup = await Group.findOne({ where: { name } });
      if (existingGroup) {
        return res.status(400).json({ error: 'Group name already exists' });
      }
    }

    await group.update({
      name: name || group.name,
      description: description !== undefined ? description : group.description,
      isActive: isActive !== undefined ? isActive : group.isActive
    });

    res.json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    await group.destroy();
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Add user to group
router.post('/:id/members', authMiddleware, [
  body('userId').isInt().withMessage('Valid user ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;
    const groupId = req.params.id;

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already in group
    const existingMembership = await group.hasUser(user);
    if (existingMembership) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    await group.addUser(user);
    res.json({ message: 'User added to group successfully' });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(500).json({ error: 'Failed to add user to group' });
  }
});

// Remove user from group
router.delete('/:id/members/:userId', authMiddleware, async (req, res) => {
  try {
    const { id: groupId, userId } = req.params;

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await group.removeUser(user);
    res.json({ message: 'User removed from group successfully' });
  } catch (error) {
    console.error('Error removing user from group:', error);
    res.status(500).json({ error: 'Failed to remove user from group' });
  }
});

module.exports = router;