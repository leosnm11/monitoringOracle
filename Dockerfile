FROM node:latest

ENV TZ=America/Sao_Paulo

RUN apt-get update -y && apt-get install alien -y

ADD https://download.oracle.com/otn_software/linux/instantclient/195000/oracle-instantclient19.5-basiclite-19.5.0.0.0-1.x86_64.rpm ./instantclient19.5-basiclite.rpm

RUN alien -i  --scripts  ./instantclient19.5-basiclite.rpm && rm ./instantclient19.5-basiclite.*


ENV LD_LIBRARY_PATH="/usr/lib/oracle/19.5/client(64)/lib/${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

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