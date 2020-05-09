import { Request, Response } from 'express';

import { container } from 'tsyringe';

import ResetPasswordService from '@modules/users/services/ResetPasswordService';

class ResetPasswordController {
  async create(req: Request, res: Response): Promise<Response> {
    const { password, token } = req.body;

    const authenticateUser = container.resolve(ResetPasswordService);

    await authenticateUser.execute({ password, token });

    return res.status(204).json();
  }
}

export default ResetPasswordController;
