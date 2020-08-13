# Monitoração Oracle via Nodejs para Zabbix HTTP Agent

## 1. Primeiro passo preparar o ambiente:

Para que o serviço funcione perfeitamente vamos precisar baixar a biblioteca
basica do oracle.

> Lembrando que vai depender do SO do host.

#### URL:

"Linux" = "https://download.oracle.com/otn_software/linux/instantclient/19600/instantclient-basic-linux.x64-19.6.0.0.0dbru.zip"
"Windows" = "https://download.oracle.com/otn_software/nt/instantclient/19600/instantclient-basic-windows.x64-19.6.0.0.0dbru.zip"

Todos na arquitetura 64x.

Agora abaixo baixar o arquivo e já ter extraído o mesmo, será necessário criar as variaveis de ambiente abaixo:

export LD_LIBRARY_PATH={local do arquivo extraído}

export HOSTIP={IP do host, caso não seja informado irá subir o serviço como localhost esse campo é opcional}

## 2. Segundo passo

Para o segundo passo será necessário clonar o projeto e criar uma imagem docker(esse item é opcional, pode executar a aplicação instalando o nodejs) conforme abaixo:

```bash
# git clone https://github.com/leosnm11/monitoringOracle.git
# cd monitoringOracle/
# docker build -t app .
# docker run --name monitoring-oracle -d -p 8080:9090 app
```

## 3. Terceiro passo

Ainda em desenvolvimento do template
