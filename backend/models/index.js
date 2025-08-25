const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User');
const Group = require('./Group');
const Folder = require('./Folder');
const Document = require('./Document');
const Permission = require('./Permission');

// User-Group associations (many-to-many)
const UserGroup = sequelize.define('UserGroup', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  groupId: {
    type: DataTypes.INTEGER,
    references: {
      model: Group,
      key: 'id'
    }
  }
}, {
  timestamps: true
});

User.belongsToMany(Group, { through: UserGroup, foreignKey: 'userId' });
Group.belongsToMany(User, { through: UserGroup, foreignKey: 'groupId' });

// Folder associations
Folder.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Folder.belongsTo(Folder, { as: 'parent', foreignKey: 'parentId' });
Folder.hasMany(Folder, { as: 'children', foreignKey: 'parentId' });
Folder.hasMany(Document, { foreignKey: 'folderId' });

// Document associations
Document.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Document.belongsTo(User, { as: 'updater', foreignKey: 'updatedBy' });
Document.belongsTo(Folder, { foreignKey: 'folderId' });

// Permission associations
Permission.belongsTo(User, { foreignKey: 'subjectId', constraints: false });
Permission.belongsTo(Group, { foreignKey: 'subjectId', constraints: false });

module.exports = {
  sequelize,
  User,
  Group,
  Folder,
  Document,
  Permission,
  UserGroup
};