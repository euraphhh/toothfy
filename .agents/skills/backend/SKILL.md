---
name: create_express_route
description: Instruções de como criar uma nova rota no Backend (Express) seguindo as convenções do projeto.
---

# Criando Rotas no Backend

- Sempre utilize a injeção de dependências para os controllers.
- Valide os dados de entrada usando o Zod.
- Capture erros com um Middleware de erro global, não use try/catch repetitivo nos controllers se estiver usando express-async-errors.
- Filtre sempre pelo `clinic_id` extraído do Token JWT para garantir o multitenant.
