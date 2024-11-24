import React from "react";

import "./App.css";
import certificateImage from "./images/certificate.png";
import { useLoadCertificates } from "./hooks/useLoadCertificates.hook";
import { Certificate, FileWithId, Result } from "./certificate.model";

function App() {
  const {
    CAData,
    certData,
    uploadCertificateEnduser,
    verifyCertificate,
    selected,
    uploadTrustedCertUpload,
  } = useLoadCertificates();

  return (
    <div className="main">
      <div className="certificates-container">
        <CAList
          CAData={CAData}
          uploadTrustedCertUpload={uploadTrustedCertUpload}
        />
        <CDList
          certData={certData}
          uploadCertificateEnduser={uploadCertificateEnduser}
          onClick={verifyCertificate}
          selected={selected}
        />
      </div>
      {selected && <Status result={selected.result} />}
    </div>
  );
}
type StatusProps = {
  result?: Result | null;
};

const Status = ({ result }: StatusProps) => {
  return (
    <div className="status-container">
      {result && (
        <div
          className={`result-status ${result.isTrusted ? "green-status" : ""}`}
        >
          {result.result}
        </div>
      )}
      <p>Detalhes</p>
      {result?.problems?.map(({ name, message, color }) => (
        <div
          className="detail-item"
          style={{ borderLeft: `5px solid ${color}` }}
        >
          {name} - {message}
        </div>
      ))}
    </div>
  );
};

export default App;

type CAListProps = {
  CAData: Certificate[];
  uploadTrustedCertUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const CAList = ({ CAData, uploadTrustedCertUpload }: CAListProps) => {
  return (
    <div className="CA-container">
      <p className="info-text">
        {CAData.length > 0 ? "Estas são suas CAs" : "Você ainda não tem CAs."}
      </p>
      <div className="listing">
        {CAData.map(({ issuer, dueDate, issued }) => {
          return (
            <div className="default-card">
              <img src={certificateImage} alt="certificado" className="image" />
              <div>
                <p className="issuedBy">Emitido por {issuer}</p>
                {issued && <p className="issuedTo">Emitido para {issued}</p>}
                <p className="dueDate">Validade {dueDate.toString()}</p>
              </div>
            </div>
          );
        })}
      </div>
      <input
        type="file"
        accept=".pem,.crt,.cer"
        multiple
        className="validCAsInput"
        onChange={uploadTrustedCertUpload}
        placeholder="Carregar ACs Confiáveis"
      />
    </div>
  );
};

type CDListProps = {
  certData: Certificate[];
  uploadCertificateEnduser: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: (value: string) => void;
  selected?: FileWithId;
};

const CDList = ({
  certData,
  uploadCertificateEnduser,
  onClick,
  selected,
}: CDListProps) => {
  return (
    <div className="CD-container">
      <p className="info-text">
        {certData.length > 0
          ? "Selecione um certificado para verificar se é valido ou não."
          : "Você ainda não tem certificados"}
      </p>
      <div className="listing">
        {certData.map(({ id, issuer, dueDate, issued }) => {
          const isTrusted = selected?.result?.isTrusted;
          return (
            <div
              className={`default-card ${
                selected?.id === id ? "default-card--selected" : ""
              }`}
              onClick={() => onClick(id)}
            >
              {selected?.id === id && (
                <div className={`flag ${isTrusted ? "trusted" : "untrusted"}`}>
                  {isTrusted ? "válido" : "inválido"}
                </div>
              )}
              <img src={certificateImage} className="image" alt="certificado" />
              <div>
                <p className="issuedBy">Emitido por {issuer}</p>
                {issued && <p className="issuedTo">Emitido para {issued}</p>}
                <p className="dueDate">Validade {dueDate.toString()}</p>
              </div>
            </div>
          );
        })}
      </div>
      <input
        type="file"
        accept=".pem,.crt,.cer"
        className="validCDsInput"
        onChange={uploadCertificateEnduser}
      />
    </div>
  );
};
