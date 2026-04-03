# DomSpy - Manual do Usuario

## O que e o DomSpy?

DomSpy e uma plataforma de monitoramento de dominios e paginas web. Ele permite que voce:

- Escaneie sites inteiros automaticamente (crawl)
- Detecte links quebrados, paginas lentas e problemas de SEO
- Visualize a estrutura do site como uma arvore interativa
- Agrupe paginas por categorias e crie funis de monitoramento
- Busque conteudo em todas as paginas escaneadas
- Gerencie usuarios com diferentes niveis de acesso

---

## Primeiro Acesso

### Login

1. Acesse a URL do DomSpy
2. Preencha o campo **Email** (ex: `user@dominio.com`)
3. Preencha o campo **Senha**
4. Clique em **Entrar**

### Criar Conta

1. Na tela de login, clique em **Criar conta**
2. Preencha: Nome, Email, Senha e Confirmar Senha
3. Clique em **Criar Conta**
4. Aguarde a aprovacao do administrador (sua conta comeca como "pendente")

> **Nota:** Senhas devem ter no minimo 8 caracteres.

---

## Niveis de Acesso

| Nivel | Pode ver | Pode editar | Pode gerenciar usuarios |
|-------|----------|-------------|------------------------|
| **Viewer** | Tudo | Nada | Nao |
| **Admin** | Tudo | Dominios, paginas, funis, grupos, crawls | Nao |
| **Super Admin** | Tudo | Tudo | Sim (aprovar, ativar, desativar, excluir) |

---

## Dashboard

A tela principal mostra uma visao geral de todo o monitoramento:

### Cards de Status
- **Dominios** - Quantidade total de dominios monitorados
- **Paginas OK** - Paginas com status 200 e tempo de resposta bom
- **Paginas Lentas** - Paginas com tempo > 900ms
- **Links Quebrados** - Paginas com erro (404, 500, etc.)

### Busca Global
O campo de busca no topo permite encontrar qualquer dominio, pagina ou conteudo:

1. Digite pelo menos 2 caracteres
2. Os resultados aparecem em tempo real
3. Clique num resultado para navegar ate ele
4. Marque **Exata** para busca case-sensitive

### Status dos Dominios
Lista todos os dominios com indicadores de cor:
- Verde = Tudo OK
- Amarelo = Paginas lentas detectadas
- Vermelho = Links quebrados detectados
- Azul (pulsando) = Crawl em andamento
- Cinza = Nunca escaneado

### Funis Ativos
Mostra seus funis com dots coloridos indicando a saude das paginas.

### Resumo Geral
- Total de paginas escaneadas
- Percentual de saude geral
- Funis ativos
- Crawls em execucao

---

## Dominios

### Adicionar um Dominio (Admin)

1. Va em **Dominios** no menu
2. Preencha **Nome do dominio** e a **URL** (ex: `https://seusite.com.br`)
3. Clique em **Adicionar**

### Iniciar um Crawl (Admin)

O crawl escaneia todas as paginas do dominio automaticamente:

1. Clique no botao verde (play) ao lado do dominio
2. O icone vai girar enquanto o crawl esta em andamento
3. Os dados atualizam automaticamente a cada 5 segundos

#### Crawl em Massa
- Clique em **Crawl Todos** para escanear todos os dominios de uma vez

#### Parar um Crawl
- Se um crawl travou ou esta demorando, clique no botao vermelho (stop)
- Use **Parar Todos** para interromper todos os crawls simultaneamente

### Remover um Dominio (Admin)
Clique no botao de lixeira (vermelho) e confirme a remocao.

> **Atencao:** Remover um dominio apaga TODAS as paginas, links e dados associados.

---

## Detalhe do Dominio

Ao clicar num dominio, voce acessa a visao detalhada:

### Cabecalho
- Nome do dominio (clique no lapis para renomear)
- URL do dominio
- Status do ultimo crawl com data e hora

### Botoes de Acao
- **Grupos** - Gerenciar grupos de paginas deste dominio
- **Alertas** - Ver todos os problemas detectados
- **Historico** - Ver historico de crawls
- **Exportar** - Baixar dados em formato CSV
- **Iniciar Crawl** - Escanear novamente

### Cards de Status
Mesmos 4 cards do dashboard, mas apenas para este dominio.

### Adicionar Paginas Manualmente (Admin)
Voce pode adicionar paginas que o crawl nao encontrou:

**Individual:**
1. Preencha a URL
2. (Opcional) Preencha o titulo
3. Clique **Adicionar**

**Em Massa:**
1. Cole varias URLs (uma por linha) na caixa de texto
2. Clique **Importar**

### Arvore de Sites
A arvore mostra a estrutura do site visualmente:

- **Tiles coloridas** representam paginas (verde = OK, amarelo = lento, vermelho = erro)
- **Linhas** conectam paginas pai-filho
- **Arraste** tiles para reorganizar (posicoes sao salvas)
- **Clique** numa tile para abrir o painel de detalhes
- **Scroll** para zoom in/out
- **Resetar Layout** para voltar ao layout automatico

---

## Painel de Detalhes da Pagina

Ao clicar numa tile, o painel lateral abre com informacoes completas:

### Informacoes Basicas
- Titulo, URL, status HTTP, tempo de resposta
- Contagem de links internos e externos
- Links quebrados (se houver)

### Alertas SEO
Mostra automaticamente problemas como:
- Tag `<title>` ausente
- Tag `<h1>` ausente
- Meta description ausente ou curta
- (Admin pode dispensar alertas clicando no X)

### Busca na Pagina
1. Digite no campo "Buscar nesta pagina..."
2. Tags aparecem mostrando onde o termo foi encontrado (Title, H1, Body, Links, etc.)
3. **Clique na tag** para rolar ate a secao - as ocorrencias ficam **destacadas em laranja**
4. Marque **Exata** para busca case-sensitive

### Estrutura de Conteudo
- **Title** - Titulo da pagina
- **H1** - Cabecalho principal
- **Meta Description** - Descricao para buscadores

### Cabecalhos
Lista todos os H2, H3, H4 da pagina com indentacao visual.

### Estrutura da Pagina (Texto + Imagens)
Mostra o conteudo da pagina na ordem real do DOM:
- Textos aparecem como paragrafos
- Imagens aparecem como cards numerados (#1, #2, #3...) na posicao exata onde aparecem na pagina
- Cada referencia de imagem mostra: nome, alt text e formato (WEBP, PNG, etc.)

### Links
- Links internos com status
- Links externos
- Links quebrados (destacados em vermelho)

### Acoes (Admin)
- **Baixar HTML** - Download do HTML da pagina
- **Crawl** - Re-escanear apenas esta pagina
- **Agrupar** - Adicionar/remover de grupos

---

## Alertas

Acesse via **Alertas** no detalhe do dominio. Mostra TODOS os problemas detectados organizados por categoria:

### Categorias de Alertas
1. **Links Quebrados** - Paginas com erro 404, 500, etc.
2. **Paginas Lentas** - Tempo de resposta > 2 segundos
3. **Sem Title** - Paginas sem tag `<title>`
4. **Sem H1** - Paginas sem tag `<h1>`
5. **Sem Meta Description** - Paginas sem descricao
6. **Description Curta** - Meta description < 50 caracteres
7. **Imagens Nao Otimizadas** - Imagens em PNG/JPG (deveria ser WEBP/AVIF)
8. **Conteudo Duplicado** - Paginas com conteudo identico
9. **Links Saindo Quebrados** - Links que apontam para paginas com erro

### Interacao
- **Clique no cabecalho** para expandir/recolher cada categoria
- **Clique num alerta** para ser levado ate a tile correspondente na arvore

---

## Funis

Funis permitem monitorar fluxos especificos de paginas, como um funil de vendas:

### Criar um Funil (Admin)

1. Va em **Funis** no menu
2. Preencha o **Nome** (ex: "Funil de Vendas - Trafego Pago")
3. (Opcional) Preencha a **Descricao**
4. Escolha uma **Cor**
5. Clique **Criar**

### Adicionar Paginas ao Funil (Admin)

Dentro do funil, voce pode adicionar paginas de duas formas:

**Por URL em Massa:**
1. Cole URLs (uma por linha) na caixa de texto
2. Clique **Adicionar**
3. As URLs devem ser de paginas ja escaneadas

**Pela Lista Visual:**
1. Clique em **Selecionar da Lista**
2. Use o campo de busca para filtrar
3. Clique na pagina desejada para adicionar
4. Paginas ja no funil aparecem como "Ja adicionada"

### Vincular Funis
Voce pode ligar funis entre si para representar fluxos complexos:

1. No dropdown "Selecionar funil para vincular..."
2. Escolha o funil
3. Clique **Vincular**
4. Funis vinculados aparecem como tags clicaveis

> **Dica:** Use vinculos para representar caminhos alternativos. Ex: "Funil Trafego Pago" vinculado a "Funil Trafego Organico" quando convergem na mesma pagina de venda.

### Arvore do Funil
O funil tem sua propria arvore visual com os mesmos comportamentos da arvore de dominios. Clique numa tile para ver os detalhes da pagina sem sair do funil.

### Gerenciar Paginas no Funil
Cada pagina tem um botao de funil (Admin):
- **Adicionar a outro funil** - Mostra lista de funis disponiveis
- **Remover deste funil** - Remove a pagina do funil atual

> **Nota:** Uma pagina pode estar em multiplos funis de multiplos dominios.

---

## Grupos

Grupos permitem categorizar paginas dentro de um dominio:

### Criar um Grupo (Admin)

1. Va em **Grupos** no menu
2. Selecione o dominio no dropdown
3. Preencha o **Nome** do grupo
4. Escolha uma **Cor**
5. Clique **Criar**

### Atribuir Paginas a Grupos

No painel de detalhes de qualquer pagina:
1. Clique em **Agrupar**
2. Selecione o grupo desejado
3. A tile na arvore mostra uma barra colorida no topo com as cores dos grupos

### Limites
- Maximo de 50 grupos por dominio

---

## Gerenciar Usuarios (Super Admin)

Acessivel apenas pelo Super Admin:

### Aprovar Usuarios
Usuarios novos ficam como "Pendente":
1. Va em **Usuarios**
2. Clique no botao verde (check) para aprovar

### Alterar Nivel de Acesso
1. Use o dropdown ao lado do usuario
2. Selecione: Super Admin, Admin ou Viewer
3. Voce nao pode alterar seu proprio nivel

### Desativar/Ativar Conta
Clique no botao de status para alternar entre Ativo e Desativado.

### Excluir Usuario
Clique na lixeira vermelha e confirme.

> **Atencao:** Voce nao pode excluir ou desativar sua propria conta.

---

## Tema Claro/Escuro

O DomSpy suporta dois temas visuais:

1. No menu lateral, clique no botao **Tema Claro** / **Tema Escuro**
2. O tema e salvo automaticamente e persiste entre sessoes

---

## Historico de Crawls

Acesse via **Historico** no detalhe do dominio:

- Lista todos os crawls ja realizados
- Mostra status (Concluido, Em andamento, Falhou, Bloqueado)
- Mostra metricas: paginas, links quebrados, paginas lentas
- Mostra duracao de cada crawl

---

## Exportar Dados

No detalhe do dominio, clique em **Exportar** para baixar um CSV com todas as paginas e seus dados.

---

## Dicas de Uso

1. **Faca crawl regularmente** para detectar problemas novos
2. **Use funis** para monitorar jornadas criticas (ex: funil de vendas)
3. **Use grupos** para organizar paginas por tipo (ex: blog, landing pages)
4. **Verifique alertas** apos cada crawl para corrigir problemas
5. **Use a busca** para encontrar rapidamente paginas especificas
6. **Otimize imagens** - troque PNG/JPG por WEBP para melhor performance
7. **Corrija links quebrados** - eles prejudicam SEO e experiencia do usuario

---

## Suporte

Para problemas ou sugestoes, contate o administrador do sistema.

DomSpy v2.0 - Monitor de Dominios
