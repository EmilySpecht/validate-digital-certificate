export type Certificate = {
  id: string;
  issuer: string;
  dueDate: string;
  issued: string;
};

export type FileWithId = {
  id: string;
  file: File;
  result?: Result;
};

export type Result = {
  result?: string;
  isTrusted?: boolean;
  problems?: Details[];
};

export type Details = {
  name: string;
  message: string;
  color: string;
  isValid: string;
};

export type ValidateCertificateResponse = {
  message: string;
  result: Details[];
};
