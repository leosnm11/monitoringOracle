FROM node:latest

RUN useradd --user-group --create-home --shel /bin/false app 

ENV HOME=/home/app


COPY package.json $HOME/
COPY . $HOME/

RUN chown -R app:app $HOME/*

WORKDIR $HOME

USER app

RUN yarn

EXPOSE 9090

CMD ["yarn", "start"]