import express from 'express';
import UserGroupController from '../controllers/UserGroupController';

const router = express.Router();

router.get('/:groupCode/users', (req, res) => UserGroupController.getUsersByGroup(req, res));

export default router;
