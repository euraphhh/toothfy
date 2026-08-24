import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../lib/auth';

const ClinicContext = createContext(null);

export const useClinic = () => useContext(ClinicContext);

export const ClinicProvider = ({ children }) => {
  const [clinic, setClinic] = useState(null);
  const [subdomain, setSubdomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkSubdomain = async () => {
      const hostname = window.location.hostname;
      
      // Remove portas caso venha, e divide por pontos
      const parts = hostname.split('.');
      
      let sub = null;
      if (parts.length >= 2 && parts[0] !== 'www') {
        if (hostname.includes('localhost') && parts.length === 2) {
          sub = parts[0];
        } else if (!hostname.includes('localhost') && parts.length >= 3) {
          sub = parts[0];
        }
      }

      if (sub) {
        setSubdomain(sub);
        if (sub !== 'app') {
          try {
            const res = await fetchApi(`/clinics/slug/${sub}`);
            if (res.ok) {
              const data = await res.json();
              setClinic(data);
            } else {
              setError('Clínica não encontrada');
            }
          } catch (err) {
            setError('Erro ao buscar clínica');
          }
        }
      }
      setLoading(false);
    };

    checkSubdomain();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;

  return (
    <ClinicContext.Provider value={{ clinic, subdomain }}>
      {children}
    </ClinicContext.Provider>
  );
};
