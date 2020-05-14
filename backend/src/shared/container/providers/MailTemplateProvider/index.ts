import { container } from 'tsyringe';

import IMailTemplateProvider from './models/IMailTemplateProvider';

import HandlebarsMailTemplatProvider from './implementations/HandlebarsMailTemplatProvider';

const providers = {
  handlebars: HandlebarsMailTemplatProvider,
};

container.registerSingleton<IMailTemplateProvider>(
  'MailTemplateProvider',
  providers.handlebars,
);
