const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = new PrismaClient();
const { sendEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}

class AuthController {
  // Etapa 1: Solicitar código
  async requestCode(req, res) {
    try {
      const { name, clinicName, email } = req.body;
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado.' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      await prisma.verificationCode.create({
        data: {
          email,
          code,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        }
      });

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Bem-vindo(a), ${name}!</h2>
          <p>Obrigado por iniciar o cadastro da <strong>${clinicName}</strong> no SaaS Odonto.</p>
          <p>Seu código de verificação é:</p>
          <h1 style="background: #f4f4f5; padding: 16px; text-align: center; letter-spacing: 5px; color: #2563eb; border-radius: 8px;">${code}</h1>
          <p>Este código expira em 15 minutos.</p>
        </div>
      `;

      await sendEmail(email, 'Seu Código de Acesso - SaaS Odonto', htmlContent);

      res.json({ message: 'Código enviado.' });
    } catch (error) {
      console.error('[Request Code Error]:', error);
      res.status(500).json({ error: 'Erro ao processar sua solicitação. Tente novamente.' });
    }
  }

  // Etapa 2: Validar Código
  async verifyCode(req, res) {
    try {
      const { email, code } = req.body;
      
      const verification = await prisma.verificationCode.findFirst({
        where: { email, code },
        orderBy: { createdAt: 'desc' }
      });

      if (!verification || verification.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Código inválido ou expirado.' });
      }

      res.json({ message: 'Código validado.' });
    } catch (error) {
      console.error('[Verify Code Error]:', error);
      res.status(500).json({ error: 'Erro interno ao verificar o código. Tente novamente.' });
    }
  }

  // Etapa 3: Finalizar
  async completeRegistration(req, res) {
    try {
      const { name, clinicName, slug, email, password, googleId } = req.body;
      
      const passwordHash = await bcrypt.hash(password, 10);

      const result = await prisma.$transaction(async (tx) => {
        const clinic = await tx.clinic.create({
          data: { name: clinicName, slug }
        });

        const user = await tx.user.create({
          data: { name, email, passwordHash, clinicId: clinic.id, googleId: googleId || null }
        });

        return { clinic, user };
      });

      const token = jwt.sign(
        { id: result.user.id, clinicId: result.clinic.id, role: result.user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        message: 'Conta criada com sucesso!', 
        token,
        user: { id: result.user.id, name: result.user.name, clinicId: result.clinic.id } 
      });
    } catch (error) {
      console.error('[Complete Registration Error]:', error);
      res.status(500).json({ error: 'Erro interno ao criar sua conta. Tente novamente.' });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password, slug } = req.body;

      const user = await prisma.user.findUnique({ 
        where: { email },
        include: { clinic: true }
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Validação de Segurança Multi-Tenant (White-label)
      if (slug && user.clinic.slug !== slug) {
        return res.status(403).json({ error: 'Esta conta não pertence a esta clínica.' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, clinicId: user.clinicId, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: { id: user.id, name: user.name, clinicId: user.clinicId }
      });
    } catch (error) {
      console.error('[Login Error]:', error);
      res.status(500).json({ error: 'Erro ao processar login. Tente novamente mais tarde.' });
    }
  }

  // Esqueci a Senha
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'Nenhum usuário encontrado com este e-mail.' });
      }

      const token = crypto.randomUUID();
      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
        }
      });

      const frontendUrl = process.env.FRONTEND_URL;
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a redefinição da sua senha no SaaS Odonto.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Minha Senha</a>
          </div>
          <p>Ou acesse o link diretamente: <br><a href="${resetLink}">${resetLink}</a></p>
          <p>Este link expira em 30 minutos.</p>
        </div>
      `;

      await sendEmail(email, 'Redefinição de Senha - SaaS Odonto', htmlContent);

      res.json({ message: 'Link de recuperação enviado com sucesso!' });
    } catch (error) {
      console.error('[Forgot Password Error]:', error);
      res.status(500).json({ error: 'Erro ao solicitar a recuperação de senha.' });
    }
  }

  // Redefinir Senha
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
      if (!resetToken) {
        return res.status(400).json({ error: 'Token inválido ou expirado.' });
      }

      if (new Date() > resetToken.expiresAt) {
        await prisma.passwordResetToken.delete({ where: { token } });
        return res.status(400).json({ error: 'Este link expirou. Solicite um novo.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { email: resetToken.email },
        data: { passwordHash }
      });

      await prisma.passwordResetToken.deleteMany({
        where: { email: resetToken.email }
      });

      res.json({ message: 'Senha atualizada com sucesso!' });
    } catch (error) {
      console.error('[Reset Password Error]:', error);
      res.status(500).json({ error: 'Erro interno ao redefinir a senha.' });
    }
  }

  // Google OAuth Callback
  async googleCallback(req, res) {
    try {
      const profile = req.user;
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const googleId = profile.id;

      // Procura por googleId ou email
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { googleId },
            { email }
          ]
        }
      });

      if (user) {
        // Se achou pelo email mas não tem googleId, fazemos o link
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId }
          });
        }

        const token = jwt.sign(
          { id: user.id, clinicId: user.clinicId, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        const frontendUrl = process.env.FRONTEND_URL;
        // Redireciona para o Front-end com sucesso
        return res.redirect(`${frontendUrl}/oauth/success?token=${token}`);
      }

      // Se NÃO achou, redireciona para a tela de registro dedicada do OAuth
      const encodedEmail = encodeURIComponent(email);
      const encodedName = encodeURIComponent(name);
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/oauth/register?email=${encodedEmail}&name=${encodedName}&googleId=${googleId}`);
      
    } catch (error) {
      console.error('[Google Auth Error]:', error);
      const frontendUrl = process.env.FRONTEND_URL;
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
}

module.exports = new AuthController();
