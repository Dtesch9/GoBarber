import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import ListProviderAppointmentsService from './ListProviderAppointmentsService';

let fakeAppointmentsRepository: FakeAppointmentsRepository;
let fakeCacheProvider: FakeCacheProvider;

let listProviderAppointmentsService: ListProviderAppointmentsService;

describe('ListProviderAppointments', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    fakeCacheProvider = new FakeCacheProvider();

    listProviderAppointmentsService = new ListProviderAppointmentsService(
      fakeAppointmentsRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to list appointments on a specific day', async () => {
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

    const dayAppointments = await Promise.all(appointmentsPromise);

    const appointments = await listProviderAppointmentsService.execute({
      provider_id: 'user',
      day: 20,
      month: 5,
      year: 2020,
    });

    expect(appointments).toEqual(dayAppointments);
  });
});
