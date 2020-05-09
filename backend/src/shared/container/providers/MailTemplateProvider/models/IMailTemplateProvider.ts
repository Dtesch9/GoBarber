import IParseMailTemplateDTO from '../dtos/IParseMailTemplateDTO';

export default interface IMailTemplateProvader {
  parse(data: IParseMailTemplateDTO): Promise<string>;
}
