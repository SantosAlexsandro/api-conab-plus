import { Router } from 'express';
import erpUserGroupController from '../controllers/ERPUserGroupController';
import loginRequired from '../middlewares/loginRequired';

// TODO: Adicionar loginRequired
const router = new Router();

router.get('/:groupCode',  erpUserGroupController.getUsersByGroup);

export default router;
