FROM node:22-bookworm-slim AS build

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

ARG VITE_API_KEY
ENV VITE_API_KEY=${VITE_API_KEY}

COPY package*.json ./
RUN npm ci

COPY . .

RUN test -n "$VITE_API_BASE_URL" || (echo "VITE_API_BASE_URL must be set for production builds" && exit 1)
RUN npm run build

FROM nginx:1.27-alpine

ENV PORT=8080

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
