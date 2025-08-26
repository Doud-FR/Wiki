const express = require('express');
const { body, validationResult } = require('express-validator');
const { Document, Folder, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all documents and folders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { folderId, search } = req.query;
    
    let whereClause = {};
    if (folderId) {
      whereClause.folderId = folderId === 'null' ? null : parseInt(folderId);
    }

    const documents = await Document.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { model: Folder, attributes: ['id', 'name'] }
      ],
      order: [['updatedAt', 'DESC']]
    });

    const folders = await Folder.findAll({
      where: folderId ? { parentId: folderId === 'null' ? null : parseInt(folderId) } : {},
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Transform to match frontend format
    const items = [
      ...folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        description: folder.description,
        type: 'folder',
        folderId: folder.parentId,
        updatedAt: folder.updatedAt,
        createdBy: `${folder.creator.firstName} ${folder.creator.lastName}`
      })),
      ...documents.map(doc => ({
        id: doc.id,
        name: doc.title,
        description: doc.content?.substring(0, 100) || '',
        type: 'document',
        folderId: doc.folderId,
        updatedAt: doc.updatedAt,
        createdBy: `${doc.creator.firstName} ${doc.creator.lastName}`
      }))
    ];

    res.json(items);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Create document
router.post('/document', authMiddleware, [
  body('name').notEmpty().withMessage('Document name required'),
  body('description').optional(),
  body('type').optional().isIn(['markdown', 'html', 'text']).withMessage('Invalid document type'),
  body('folderId').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, type = 'markdown', folderId } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const document = await Document.create({
      title: name,
      slug,
      content: description || '',
      contentType: type,
      folderId: folderId || null,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      isPublished: false
    });

    res.status(201).json({
      id: document.id,
      name: document.title,
      description: document.content,
      type: 'document',
      folderId: document.folderId,
      updatedAt: document.updatedAt,
      createdBy: `${req.user.firstName} ${req.user.lastName}`
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Create folder
router.post('/folder', authMiddleware, [
  body('name').notEmpty().withMessage('Folder name required'),
  body('description').optional(),
  body('parentId').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, parentId } = req.body;

    // Generate path
    let path = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (parentId) {
      const parentFolder = await Folder.findByPk(parentId);
      if (parentFolder) {
        path = `${parentFolder.path}/${path}`;
      }
    }

    const folder = await Folder.create({
      name,
      description: description || '',
      path,
      parentId: parentId || null,
      createdBy: req.user.id
    });

    res.status(201).json({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      type: 'folder',
      folderId: folder.parentId,
      updatedAt: folder.updatedAt,
      createdBy: `${req.user.firstName} ${req.user.lastName}`
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Get document by ID
router.get('/document/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { model: Folder, attributes: ['id', 'name'] }
      ]
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      id: document.id,
      title: document.title,
      content: document.content,
      contentType: document.contentType,
      folderId: document.folderId,
      isPublished: document.isPublished,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      creator: document.creator
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Update document
router.put('/document/:id', authMiddleware, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional(),
  body('contentType').optional().isIn(['markdown', 'html', 'text']),
  body('isPublished').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { title, content, contentType, isPublished } = req.body;
    
    await document.update({
      title: title || document.title,
      content: content !== undefined ? content : document.content,
      contentType: contentType || document.contentType,
      isPublished: isPublished !== undefined ? isPublished : document.isPublished,
      updatedBy: req.user.id
    });

    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
router.delete('/document/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await document.destroy();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Delete folder
router.delete('/folder/:id', authMiddleware, async (req, res) => {
  try {
    const folder = await Folder.findByPk(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if folder has children
    const childFolders = await Folder.count({ where: { parentId: folder.id } });
    const childDocuments = await Document.count({ where: { folderId: folder.id } });

    if (childFolders > 0 || childDocuments > 0) {
      return res.status(400).json({ error: 'Cannot delete folder with contents' });
    }

    await folder.destroy();
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

module.exports = router;