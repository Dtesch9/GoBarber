import AppError from '@shared/errors/AppError';

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import ShowProfileService from './ShowProfileService';

let fakeUserRepository: FakeUsersRepository;
let showProfileService: ShowProfileService;

describe('ShowProfile', () => {
  beforeEach(() => {
    fakeUserRepository = new FakeUsersRepository();

    showProfileService = new ShowProfileService(fakeUserRepository);
  });

  it('should be able to show user profile', async () => {
    const user = await fakeUserRepository.create({
      name: 'John Doe Show',
      email: 'johndoe@example.com',
      password: '123456',
    });

    const showUser = await showProfileService.execute({
      user_id: user.id,
    });

    expect(showUser.name).toBe('John Doe Show');
    expect(showUser.email).toBe('johndoe@example.com');
  });

  it('should not be able to show not existing user', async () => {
    await expect(
      showProfileService.execute({
        user_id: 'no-existing-user',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
