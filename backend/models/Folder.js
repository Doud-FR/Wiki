const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Folder = sequelize.define('Folder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  parentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Folders',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Folder;