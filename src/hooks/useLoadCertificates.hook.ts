import React, { useEffect, useState } from "react";
import forge from "node-forge";
import {
  Certificate,
  FileWithId,
  ValidateCertificateResponse,
} from "../certificate.model";
import { useValidateCertificate } from "./useValidateCertificate.hook";

const ONLY_CA = "Adicione apenas certificados de Autoridades Certificadoras";
const TRUSTED = `Certificado válido`;
const UNTRUSTED = `Certificado inválido`;

export const useLoadCertificates = () => {
  const [certificate, setCertificate] = useState<FileWithId[]>([]);
  const [CA, setCA] = useState<(FileWithId & { pem?: string })[]>([]);
  const [certData, setCertData] = useState<Certificate[]>([]);
  const [CAData, setCAData] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<FileWithId>();
  const {
    uploadCA,
    uploadCertificate,
    validateCertificate,
    cleanCertificateDir,
  } = useValidateCertificate();

  useEffect(() => {
    cleanCertificateDir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadCertificateEnduser = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target?.files?.[0];

    try {
      if (file) {
        const response = await uploadCertificate(file);
        setCertificate([...certificate, { id: response.fileName, file }]);
      }
    } catch (e) {
      alert(`Algo deu errado, ${e}`);
    }
  };

  const uploadTrustedCertUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target?.files;

    try {
      if (files && files.length > 0) setCAs(files);
    } catch (e) {
      alert(`Algo deu errado, ${e}`);
    }
  };

  const setCAs = (files: FileList | File[]) => {
    Array.from(files).forEach(async (file, index) => {
      const reader = new FileReader();

      reader.onload = async () => {
        if (reader.result) {
          const response = await uploadCA(file);
          setCA((prev) => [
            ...prev,
            {
              id: response.fileName,
              file: files[index],
              // pem: reader.result as string,
            },
          ]);
        }
      };

      if (await isCAVerify(file)) reader.readAsText(file);
      else alert(ONLY_CA);
    });
  };

  const isCAVerify = async (CA: File) => {
    const resultPromise = new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const certificate = forge.pki.certificateFromPem(
            reader.result as string
          );

          const basicConstraints = certificate.getExtension(
            "basicConstraints"
          ) as any;

          if (basicConstraints?.cA) resolve(true);

          resolve(false);
        } catch (e) {
          resolve(true);
        }
      };

      reader.readAsText(CA);
    });
    return resultPromise;
  };

  const verifyCertificate = async (id: string) => {
    const certificateToValidate = certificate.find((cert) => cert.id === id);
    const reader = new FileReader();
    let isValidByOpenssl: ValidateCertificateResponse | undefined;

    reader.onload = () => {
      // const pem = reader.result as string;
      // const cert = forge.pki.certificateFromPem(pem);

      // let currentCert = cert;
      let isTrusted = false;

      // const issuerHash = currentCert.issuer.hash;
      // const trustedCert = CA.find(({ pem }) => {
      //   const trusted = forge.pki.certificateFromPem(pem);
      //   return trusted.subject.hash === issuerHash;
      // });

      // if (trustedCert)
      isTrusted = !isValidByOpenssl?.result.some((res) => !res.isValid);

      const result = isTrusted ? TRUSTED : UNTRUSTED;

      if (certificateToValidate)
        setCertificate(
          certificate.map((cert) => {
            if (cert.id === id) {
              const certificate = {
                ...cert,
                result: {
                  problems: isValidByOpenssl?.result,
                  isTrusted,
                  result,
                },
              };

              setSelected(certificate);
              return certificate;
            }
            return cert;
          })
        );
    };

    if (certificateToValidate) {
      isValidByOpenssl = await validateCertificate(certificateToValidate.id);
      reader.readAsText(certificateToValidate.file);
    }
  };

  const handleReadCertificates = async (
    certs: FileWithId[],
    set: (value: React.SetStateAction<Certificate[]>) => void
  ) => {
    console.log(certs);

    const certPromises = certs.map((cert) => {
      return new Promise<Certificate>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const certificate = forge.pki.certificateFromPem(
              reader.result as string
            );

            const issuer = certificate.issuer.attributes.find(
              ({ shortName }) => shortName === "CN"
            );
            resolve({
              id: cert.id,
              issuer: (issuer?.value as string) ?? "(indefinido)",
              dueDate: certificate.validity.notAfter.toString(),
              issued: certificate.issued.name,
            });
          } catch (e) {
            resolve({
              id: cert.id,
              issuer: "(indefinido)",
              dueDate: "(indefinido)",
              issued: "(indefinido)",
            });
          }
        };
        reader.readAsText(cert.file);
      });
    });
    const certResults = await Promise.all(certPromises);
    set(certResults);
  };

  useEffect(() => {
    handleReadCertificates(certificate, setCertData);
    handleReadCertificates(CA, setCAData);
  }, [certificate, CA]);

  return {
    CAData,
    certData,
    uploadCertificateEnduser,
    verifyCertificate,
    selected,
    uploadTrustedCertUpload,
    certificate,
  };
};
