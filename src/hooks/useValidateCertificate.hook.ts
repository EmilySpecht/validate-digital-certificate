import axios from "axios";
import { FileWithId, ValidateCertificateResponse } from "../certificate.model";

export const useValidateCertificate = () => {
  axios.defaults.baseURL =
    "http://ec2-18-230-196-245.sa-east-1.compute.amazonaws.com:3001";
  axios.defaults.timeout = 15000;

  const validateCertificate = async (
    certFileName: string
  ): Promise<ValidateCertificateResponse | undefined> => {
    try {
      const response = await axios.post(`/validate-cert`, { certFileName });

      return response.data;
    } catch (e) {
      alert("Algo deu errado. Consulte o console do navegador.");
      console.error(e);
    }
  };

  const uploadCertificate = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("certificate", file);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      const response = await axios.post(`/upload-cert`, formData, config);

      return response.data;
    } catch (e) {
      alert("Algo deu errado. Consulte o console do navegador.");
      console.error(e);
    }
  };

  const uploadCA = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("caCertificate", file);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      const response = await axios.post(`/upload-ca`, formData, config);

      return response.data;
    } catch (e) {
      alert("Algo deu errado. Consulte o console do navegador.");
      console.error(e);
    }
  };

  const getCertificates = async (
    type: "ca" | "certs"
  ): Promise<FileWithId[] | undefined> => {
    try {
      const response = await axios.get(`/list-certificates?type=${type}`);

      return response.data;
    } catch (e) {
      alert("Algo deu errado. Consulte o console do navegador.");
      console.error(e);
    }
  };

  const cleanCertificateDir = async () => {
    try {
      const response = await axios.delete(`/clear-uploads`);

      return response.data;
    } catch (e) {
      alert("Algo deu errado. Consulte o console do navegador.");
      console.error(e);
    }
  };

  return {
    validateCertificate,
    uploadCA,
    uploadCertificate,
    getCertificates,
    cleanCertificateDir,
  };
};
