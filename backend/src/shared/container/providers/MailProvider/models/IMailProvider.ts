interface ISendMail {
  to: string;
  body: string;
}

export default interface IMailProvider {
  sendMail(data: ISendMail): Promise<void>;
}
