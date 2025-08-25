const { Permission, User, Group } = require('../models');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const { resourceType, resourceId } = req.params;
      const userId = req.user.id;

      // Admin users have all permissions
      if (req.user.isAdmin) {
        return next();
      }

      // Check direct user permissions
      const userPermission = await Permission.findOne({
        where: {
          resourceType,
          resourceId,
          subjectType: 'user',
          subjectId: userId
        }
      });

      if (userPermission) {
        if (userPermission.permission === 'deny') {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (hasRequiredPermission(userPermission.permission, requiredPermission)) {
          return next();
        }
      }

      // Check group permissions
      const user = await User.findByPk(userId, {
        include: [{ model: Group }]
      });

      for (const group of user.Groups) {
        const groupPermission = await Permission.findOne({
          where: {
            resourceType,
            resourceId,
            subjectType: 'group',
            subjectId: group.id
          }
        });

        if (groupPermission) {
          if (groupPermission.permission === 'deny') {
            return res.status(403).json({ error: 'Access denied' });
          }
          if (hasRequiredPermission(groupPermission.permission, requiredPermission)) {
            return next();
          }
        }
      }

      // No permissions found
      res.status(403).json({ error: 'Insufficient permissions' });
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

const hasRequiredPermission = (userPermission, requiredPermission) => {
  const permissions = {
    'read': 1,
    'write': 2,
    'admin': 3
  };

  return permissions[userPermission] >= permissions[requiredPermission];
};

module.exports = { checkPermission };