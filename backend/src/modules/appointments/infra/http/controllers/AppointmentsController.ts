import { Request, Response } from 'express';
import { parseISO } from 'date-fns';
import { container } from 'tsyringe';

import AppointmentsRepository from '@modules/appointments/infra/typeorm/repositories/AppointmentsRepository';

import CreateAppointmentService from '@modules/appointments/services/CreateAppointmentService';

export default class AppointmentsController {
  public async index(req: Request, res: Response): Promise<Response> {
    const appointmentsRepository = new AppointmentsRepository();

    const appointments = await appointmentsRepository.findAll();

    return res.json(appointments);
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const user_id = req.user.id;

    const { provider_id, date } = req.body;

    const parsedDate = parseISO(date);

    const createAppointmentService = container.resolve(
      CreateAppointmentService,
    );

    const appointment = await createAppointmentService.execute({
      date: parsedDate,
      user_id,
      provider_id,
    });

    return res.json({ appointment });
  }
}
