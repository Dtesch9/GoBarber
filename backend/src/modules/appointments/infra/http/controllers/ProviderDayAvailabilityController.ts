import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ListProviderDayAvailabilityService from '@modules/appointments/services/ListProviderDayAvailabilityService';

class ProviderDayAvailabilityController {
  public async index(req: Request, res: Response): Promise<Response> {
    const { provider_id } = req.params;

    const { day, month, year } = req.body;

    const listProviderDayAvailabilityService = container.resolve(
      ListProviderDayAvailabilityService,
    );

    const hourAvailability = await listProviderDayAvailabilityService.execute({
      provider_id,
      day,
      month,
      year,
    });

    return res.json(hourAvailability);
  }
}

export default ProviderDayAvailabilityController;
