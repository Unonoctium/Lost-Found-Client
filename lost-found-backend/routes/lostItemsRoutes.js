const express = require('express');
const multer = require('multer');
const { createLostItem, getAllLostItems } = require('../controllers/lostItemController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/', upload.single('image'), createLostItem);
router.get('/', getAllLostItems);

module.exports = router;
