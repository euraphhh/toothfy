import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken } from '../../lib/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      setToken(token);
      toast.success('Login com Google realizado com sucesso!');
      navigate('/');
    } else {
      toast.error('Erro na autenticação com o Google.');
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4 h-full min-h-[400px]">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-muted-foreground animate-pulse">Conectando sua conta Google...</p>
    </div>
  );
}
