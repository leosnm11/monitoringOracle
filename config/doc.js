import dotenv from 'dotenv';

dotenv.config();

const http = process.env.HOSTIP || 'localhost';

export const swaggerDocuments = {
  swagger: '2.0',
  info: {
    description: 'Monitoração Banco',
    version: '1.0.0',
    title: 'Monitoração Oracle',
  },
  host: `${http}:9090`,
  tags: [
    {
      name: 'Métricas padrão',
      description: 'Monitoração padrão oracle',
    },
    {
      name: 'Discovery',
      description: 'Faz a descoberta e monitoração dos items',
    },
    {
      name: 'Selects',
      description: 'Aplicar select que não estejam na coleta padrão.',
    },
  ],
  paths: {
    '/oracle': {
      get: {
        tags: ['Métricas padrão'],
        summary: 'Get 56 metrics oracle',
        description:
          'Para coletar as métricas será necessário informar no cabeçalho o host, usuário e senha do banco',
        consumes: ['application/json'],
        parameters: [
          {
            name: 'database',
            in: 'header',
            description:
              'String de conexão com o banco. Exemplo: "localhost:1521/SERVICENAME"',
            type: 'string',
            required: true,
          },
          {
            name: 'user',
            in: 'header',
            description: 'Usuário do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'pass',
            in: 'header',
            description: 'Senha do banco',
            required: true,
            type: 'string',
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            schema: {
              type: 'array',
              items: {
                $ref: '#/definitions/GetAllMetricOracle',
              },
            },
          },
          '500': {
            description: 'Error occurred',
          },
        },
      },
    },
    '/oracle/locked': {
      get: {
        tags: ['Métricas padrão'],
        summary: 'Get locked in database',
        description:
          'Para coletar as métricas será necessário informar no cabeçalho o host, usuário e senha do banco',
        consumes: ['application/json'],
        parameters: [
          {
            name: 'database',
            in: 'header',
            description: 'String de conexão com o banco',
            type: 'string',
            format: 'localhost:1521/SERVICENAME',
            required: true,
          },
          {
            name: 'user',
            in: 'header',
            description: 'Usuário do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'pass',
            in: 'header',
            description: 'Senha do banco',
            required: true,
            type: 'string',
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            schema: {
              type: 'object',
              properties: {
                metric: {
                  type: 'string',
                },
              },
            },
          },
          '500': {
            description: 'Error occurred',
          },
        },
      },
    },
    '/oracle/lockwait': {
      get: {
        tags: ['Métricas padrão'],
        summary: 'Get lockwait in database',
        description:
          'Para coletar as métricas será necessário informar no cabeçalho o host, usuário e senha do banco',
        consumes: ['application/json'],
        parameters: [
          {
            name: 'database',
            in: 'header',
            description: 'String de conexão com o banco',
            type: 'string',
            format: 'localhost:1521/SERVICENAME',
            required: true,
          },
          {
            name: 'user',
            in: 'header',
            description: 'Usuário do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'pass',
            in: 'header',
            description: 'Senha do banco',
            required: true,
            type: 'string',
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            schema: {
              type: 'object',
              properties: {
                metric: {
                  type: 'string',
                },
              },
            },
          },
          '500': {
            description: 'Error occurred',
          },
        },
      },
    },
    '/oracle/tablespace': {
      get: {
        tags: ['Discovery'],
        summary: 'Discovery tablespace name',
        description:
          'Para coletar as métricas será necessário informar no cabeçalho o host, usuário e senha do banco',
        consumes: ['application/json'],
        parameters: [
          {
            name: 'database',
            in: 'header',
            description: 'String de conexão com o banco',
            type: 'string',
            format: 'localhost:1521/SERVICENAME',
            required: true,
          },
          {
            name: 'user',
            in: 'header',
            description: 'Usuário do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'pass',
            in: 'header',
            description: 'Senha do banco',
            required: true,
            type: 'string',
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            schema: {
              type: 'object',
              properties: {
                metric: {
                  type: 'string',
                },
              },
            },
          },
          '500': {
            description: 'Error occurred',
          },
        },
      },
      post: {
        tags: ['Métricas padrão'],
        summary: 'Get metrics tablespace',
        description:
          'Para coletar as métricas será necessário informar no cabeçalho o host, usuário e senha do banco',
        consumes: ['application/json'],
        parameters: [
          {
            name: 'database',
            in: 'header',
            description: 'String de conexão com o banco',
            type: 'string',
            format: 'localhost:1521/SERVICENAME',
            required: true,
          },
          {
            name: 'user',
            in: 'header',
            description: 'Usuário do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'pass',
            in: 'header',
            description: 'Senha do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'tablespace',
            in: 'body',
            description: 'Informe tablespacename ',
            required: true,
            schema: {
              properties: {
                tablespace: {
                  type: 'string',
                },
              },
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            schema: {
              type: 'object',
              properties: {
                metric: {
                  type: 'string',
                },
              },
            },
          },
          '500': {
            description: 'Error occurred',
          },
        },
      },
    },
    '/oracle/instance': {
      get: {
        tags: ['Discovery'],
        summary: 'Discovery instance name',
        description:
          'Para coletar as métricas será necessário informar no cabeçalho o host, usuário e senha do banco',
        consumes: ['application/json'],
        parameters: [
          {
            name: 'database',
            in: 'header',
            description: 'String de conexão com o banco',
            type: 'string',
            format: 'localhost:1521/SERVICENAME',
            required: true,
          },
          {
            name: 'user',
            in: 'header',
            description: 'Usuário do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'pass',
            in: 'header',
            description: 'Senha do banco',
            required: true,
            type: 'string',
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            schema: {
              type: 'object',
              properties: {
                metric: {
                  type: 'string',
                },
              },
            },
          },
          '500': {
            description: 'Error occurred',
          },
        },
      },
      post: {
        tags: ['Métricas padrão'],
        summary: 'Get metrics tablespace',
        description:
          'Para coletar as métricas será necessário informar no cabeçalho o host, usuário e senha do banco',
        consumes: ['application/json'],
        parameters: [
          {
            name: 'database',
            in: 'header',
            description: 'String de conexão com o banco',
            type: 'string',
            format: 'localhost:1521/SERVICENAME',
            required: true,
          },
          {
            name: 'user',
            in: 'header',
            description: 'Usuário do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'pass',
            in: 'header',
            description: 'Senha do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'instance',
            in: 'body',
            description: 'Informe instance',
            required: true,
            schema: {
              properties: {
                instance: {
                  type: 'string',
                },
              },
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            schema: {
              type: 'object',
              properties: {
                metric: {
                  type: 'string',
                },
              },
            },
          },
          '500': {
            description: 'Error occurred',
          },
        },
      },
    },
    '/oracle/select': {
      post: {
        tags: ['Selects'],
        summary: 'Select for business rules',
        description:
          'Para coletar as métricas será necessário informar no cabeçalho o host, usuário e senha do banco',
        consumes: ['application/json'],
        parameters: [
          {
            name: 'database',
            in: 'header',
            description: 'String de conexão com o banco',
            type: 'string',
            format: 'localhost:1521/SERVICENAME',
            required: true,
          },
          {
            name: 'user',
            in: 'header',
            description: 'Usuário do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'pass',
            in: 'header',
            description: 'Senha do banco',
            required: true,
            type: 'string',
          },
          {
            name: 'select',
            in: 'body',
            description:
              "Informe select exemplo: \"SELECT * FROM orders WHERE order_date < TO_DATE('2000-06-15', 'YYYY-MM-DD');\"",
            required: true,
            schema: {
              properties: {
                select: {
                  type: 'string',
                },
              },
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            schema: {
              type: 'object',
              properties: {
                metric: {
                  type: 'string',
                },
              },
            },
          },
          '500': {
            description: 'Error occurred',
          },
        },
      },
    },
  },
  definitions: {
    GetAllMetricOracle: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
        },
        metric2: {
          type: 'string',
        },
        'metric...': {
          type: 'string',
        },
      },
    },
  },
};
