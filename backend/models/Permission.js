const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  resourceType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['folder', 'document']]
    }
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subjectType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['user', 'group']]
    }
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  permission: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['read', 'write', 'admin', 'deny']]
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['resourceType', 'resourceId', 'subjectType', 'subjectId']
    }
  ]
});

module.exports = Permission;