const express = require('express');

const router = express.Router();

const messageController = require('../controllers/messageController');
const userController = require('../controllers/userController');

router.get('/', messageController.message_list);

router.get('/add-message', messageController.message_create_get);
router.post('/add-message', messageController.message_create_post);

router.post('/delete-message', messageController.message_delete_post);

router.get('/register', userController.user_create_get);
router.post('/register', userController.user_create_post);

router.get('/membership', userController.user_membership_get);
router.post('/membership', userController.user_membership_post);

router.get('/admin', userController.user_admin_get);
router.post('/admin', userController.user_admin_post);

router.get('/login', userController.user_login_get);
router.post('/login', userController.user_login_post);

router.get('/login-guest', userController.user_login_guest);

router.get('/logout', userController.user_logout);

module.exports = router;
