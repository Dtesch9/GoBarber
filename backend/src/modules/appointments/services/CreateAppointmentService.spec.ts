import AppError from '@shared/errors/AppError';

import FakeNotificationRepository from '@modules/notifications/repositories/fakes/FakeNotificationsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import CreateAppointmentService from './CreateAppointmentService';

let fakeAppointmentsRepository: FakeAppointmentsRepository;
let fakeNotificationRepository: FakeNotificationRepository;
let fakeCacheProvider: FakeCacheProvider;

let createAppointmentService: CreateAppointmentService;

describe('CreateAppointment', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    fakeNotificationRepository = new FakeNotificationRepository();
    fakeCacheProvider = new FakeCacheProvider();

    createAppointmentService = new CreateAppointmentService(
      fakeAppointmentsRepository,
      fakeNotificationRepository,
      fakeCacheProvider,
    );

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });
  });

  it('Should be able to create a new appointment', async () => {
    const appointment = await createAppointmentService.execute({
      user_id: 'user_id',
      date: new Date(2020, 4, 10, 13),
      provider_id: '123456',
    });

    expect(appointment).toHaveProperty('id');
    expect(appointment.provider_id).toBe('123456');
  });

  it('Should not be able to create two appointments on the same time', async () => {
    const appointmentDate = new Date(2020, 4, 10, 15);

    await fakeAppointmentsRepository.create({
      user_id: 'user_id',
      date: appointmentDate,
      provider_id: '123456',
    });

    await expect(
      createAppointmentService.execute({
        user_id: 'user_id',
        date: appointmentDate,
        provider_id: '123456',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('Should not be able o create an appointment on a past date', async () => {
    await expect(
      createAppointmentService.execute({
        user_id: 'user_id',
        date: new Date(2020, 4, 10, 11),
        provider_id: '123456',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('Should not be able o create an appointment with yourself', async () => {
    await expect(
      createAppointmentService.execute({
        user_id: 'user_id',
        date: new Date(2020, 4, 10, 13),
        provider_id: 'user_id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('Should not be able o create an appointment before 8am and after 5pm', async () => {
    await expect(
      createAppointmentService.execute({
        user_id: 'user_id',
        date: new Date(2020, 4, 11, 7),
        provider_id: 'provider_id',
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      createAppointmentService.execute({
        user_id: 'user_id',
        date: new Date(2020, 4, 11, 18),
        provider_id: 'provider_id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
