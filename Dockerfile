FROM node:14.8

ENV HOME=/app     \
    LANG=C.UTF-8  \
    TZ=Asia/Tokyo \
    HOST=0.0.0.0

WORKDIR ${HOME}
COPY package.json ${HOME}
COPY yarn.lock ${HOME}

RUN apt -y update && \
    apt -y upgrade && \
    yarn install

COPY . ${HOME}
EXPOSE 3000 8000
CMD ["yarn", "run", "dev"]