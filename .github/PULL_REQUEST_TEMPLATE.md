<!-- Este Pull Request deve ter como base a branch develop. PRs para a main não são aceitos. -->

# 📌 Descrição

Explique de forma clara o objetivo deste Pull Request.

---

# 🔗 Issue relacionada

Refs #

<!-- Use "Refs #número". A issue será fechada manualmente após o merge na develop,
     pois o fechamento automático só acontece na branch padrão (main). -->

---

# 🚀 Tipo de alteração

Marque as opções aplicáveis:

- [ ] Correção de bug
- [ ] Nova funcionalidade
- [ ] Refatoração
- [ ] Acessibilidade
- [ ] Internacionalização (i18n)
- [ ] Melhoria de documentação
- [ ] Testes automatizados
- [ ] Build, dependências ou CI
- [ ] Outro

---

# 🎯 Destino

- [ ] A base deste PR é a branch `develop`
- [ ] Minha branch foi criada a partir da `develop` atualizada
- [ ] Fiz o push dos meus commits e eles aparecem na aba **Commits** deste PR

---

# 🧪 O que foi validado?

Comandos rodados na pasta `frontend`, com Node 20:

- [ ] `npx tsc --noEmit` passou
- [ ] `npm run build` passou
- [ ] `npm run lint` passou (no Windows, desconsidere os avisos `Delete ␍`, que vêm só do fim de linha)
- [ ] Testei a tela no navegador, com o backend rodando
- [ ] Textos novos existem nos três idiomas (pt-BR, en, es)
- [ ] Funciona nos temas claro e escuro, sem cores fixas
- [ ] Os critérios de aceitação da issue foram cumpridos

---

# 🔒 Arquivos sensíveis

- [ ] Não alterei o `package.json` nem o `.gitignore` da raiz, nem o `frontend/bun.lock` (usados só pelo Lovable)
- [ ] Não incluí tokens, senhas, `client_id`, `client_secret` nem o conteúdo do `.env.local`
- [ ] Se mudei dependências, expliquei o motivo nas observações

---

# 📖 Documentação

- [ ] Documentos em `docs/` atualizados (se o comportamento mudou)
- [ ] Não se aplica

---

# 📷 Evidências (opcional)

Adicione prints (de preferência nos temas claro e escuro), gravações ou exemplos relevantes.

---

# 💬 Observações adicionais

Inclua qualquer contexto importante para revisão. Se a mudança depende do backend, cite a issue com a referência completa (`Albertinesilva/backend-engineering-journey-java-springboot#N`).
