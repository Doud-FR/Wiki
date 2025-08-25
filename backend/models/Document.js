const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT
  },
  contentType: {
    type: DataTypes.STRING,
    defaultValue: 'markdown',
    validate: {
      isIn: [['markdown', 'html', 'text']]
    }
  },
  folderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Folders',
      key: 'id'
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishedAt: {
    type: DataTypes.DATE
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  tags: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('tags');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value || []));
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug', 'folderId']
    }
  ]
});

module.exports = Document;