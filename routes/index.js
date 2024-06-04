const express = require('express');

const router = express.Router();

const messageController = require('../controllers/messageController');
const userController = require('../controllers/userController');

router.get('/', messageController.message_list);

router.get('/register', userController.user_create_get);
router.post('/register', userController.user_create_post);

router.get('/login', userController.user_login_get);
router.post('/login', userController.user_login_post);

router.get('/logout', userController.user_logout);

module.exports = router;
