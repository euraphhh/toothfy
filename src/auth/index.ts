import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { organization } from "better-auth/plugins";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
  }),
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const url = (data as any).url || `http://localhost:3000/accept-invitation/${data.invitation.id}`;
        await resend.emails.send({
          from: "Toothfy <no-reply@toothfy.com>",
          to: data.email,
          subject: "Convite para se juntar à organização no Toothfy",
          text: `Você foi convidado para a organização. Acesse o link para aceitar: ${url}`,
        });
      }
    })
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async sendResetPassword(data, request) {
      await resend.emails.send({
        from: "Toothfy <no-reply@toothfy.com>",
        to: data.user.email,
        subject: "Redefinição de Senha do Toothfy",
        text: `Clique no link para redefinir sua senha: ${data.url}`,
      });
    }
  },
  emailVerification: {
    async sendVerificationEmail(data, request) {
      await resend.emails.send({
        from: "Toothfy <no-reply@toothfy.com>",
        to: data.user.email,
        subject: "Verifique seu e-mail no Toothfy",
        text: `Clique no link para verificar seu e-mail: ${data.url}`,
      });
    }
  }
});
