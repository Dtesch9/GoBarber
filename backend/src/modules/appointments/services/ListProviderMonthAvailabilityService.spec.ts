import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import ListProviderMonthAvailabilityService from './ListProviderMonthAvailabilityService';

let fakeAppointmentsRepository: FakeAppointmentsRepository;
let listProviderMonthAvailabilityService: ListProviderMonthAvailabilityService;

describe('ListProviderMonthAvailability', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();

    listProviderMonthAvailabilityService = new ListProviderMonthAvailabilityService(
      fakeAppointmentsRepository,
    );
  });

  it('should be able to list the month availability from provider', async () => {
    const appointmentsPromise = [];
    let hour = 8;

    while (appointmentsPromise.length < 10) {
      const appointment = fakeAppointmentsRepository.create({
        provider_id: 'user',
        user_id: 'user_id',
        date: new Date(2020, 4, 20, hour, 0, 0),
      });

      appointmentsPromise.push(appointment);

      hour += 1;
    }

    await fakeAppointmentsRepository.create({
      provider_id: 'user',
      user_id: 'user_id',
      date: new Date(2020, 4, 21, 8, 0, 0),
    });

    await Promise.all(appointmentsPromise);

    const availability = await listProviderMonthAvailabilityService.execute({
      provider_id: 'user',
      year: 2020,
      month: 5,
    });

    expect(availability).toEqual(
      expect.arrayContaining([
        { day: 19, available: true },
        { day: 20, available: false },
        { day: 21, available: true },
        { day: 22, available: true },
      ]),
    );
  });
});
