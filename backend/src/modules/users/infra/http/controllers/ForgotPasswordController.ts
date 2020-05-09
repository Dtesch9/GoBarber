import { Request, Response } from 'express';

import { container } from 'tsyringe';

import SendForgotPasswordEmailService from '@modules/users/services/SendForgotPasswordEmailService';

class ForgotPasswordController {
  async create(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    const authenticateUser = container.resolve(SendForgotPasswordEmailService);

    await authenticateUser.execute({ email });

    return res.status(204).json();
  }
}

export default ForgotPasswordController;
