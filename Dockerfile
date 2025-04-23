# Usa imagem leve com Node.js
FROM node:18.19.1-alpine

# Diretório principal dentro do container
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm install --omit=dev

# Copia o restante do código
COPY . .

# Compila o código com Sucrase (gera dist/)
# RUN npm run build  //comentado o npm run build, porque o dist/ já estará pronto.

# Expõe a porta da aplicação
EXPOSE 3002

# Comando para iniciar o backend
CMD ["npm", "start"]
