import oracledb from 'oracledb';
import allSelect from '../helpers/Select.js';

oracledb.initOracleClient({
  libDir: 'C:\\Users\\u003350\\Documents\\dboracle\\instantclient_19_6',
});
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.prefetchRows = 10000;
oracledb.poolMax = 4;

const findAllMetrics = async (req, res) => {
  const dbHost = req.headers.database;
  const dbUser = req.headers.user;
  const dbPass = req.headers.pass;
  let connection;
  try {
    connection = await oracledb.getConnection({
      connectString: dbHost,
      user: dbUser,
      password: dbPass,
    });
    const result = await connection.execute(
      `
       ${allSelect.allMetrics}
      `
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};
const findAllMetrics2 = async (req, res) => {
  const dbHost = req.headers.database;
  const dbUser = req.headers.user;
  const dbPass = req.headers.pass;
  let connection;
  try {
    connection = await oracledb.getConnection({
      connectString: dbHost,
      user: dbUser,
      password: dbPass,
    });
    const result = await connection.execute(
      `
       ${allSelect.allMetrics2}
      `
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};
const findLockWait = async (req, res) => {
  const dbHost = req.headers.database;
  const dbUser = req.headers.user;
  const dbPass = req.headers.pass;
  let connection;
  try {
    connection = await oracledb.getConnection({
      connectString: dbHost,
      user: dbUser,
      password: dbPass,
    });
    const result = await connection.execute(
      `
       ${allSelect.allLockWait}
      `
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

const findAllSelect = async (req, res) => {
  const dbHost = req.headers.database;
  const dbUser = req.headers.user;
  const dbPass = req.headers.pass;
  const select = req.body.select;
  let connection;
  try {
    connection = await oracledb.getConnection({
      connectString: dbHost,
      user: dbUser,
      password: dbPass,
    });
    const result = await connection.execute(
      `
      ${select}
      `
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

const findAllTableSpace = async (req, res) => {
  const dbHost = req.headers.database;
  const dbUser = req.headers.user;
  const dbPass = req.headers.pass;
  let connection;
  try {
    connection = await oracledb.getConnection({
      connectString: dbHost,
      user: dbUser,
      password: dbPass,
    });
    const result = await connection.execute(
      `
      ${allSelect.discTableSpace}
      `
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

const collectTablespace = async (req, res) => {
  const dbHost = req.headers.database;
  const dbUser = req.headers.user;
  const dbPass = req.headers.pass;
  const tableSpace = req.body.tablespace;
  let connection;
  try {
    connection = await oracledb.getConnection({
      connectString: dbHost,
      user: dbUser,
      password: dbPass,
    });

    const result = await connection.execute(
      `
      Select
        (${allSelect.tableSpaceBytesUsed}'${tableSpace}') As "Bytes Used",
        (${allSelect.tableSpacePercentUsed}'${tableSpace}') As "Percent Used",
        (${allSelect.tableSpaceFree}'${tableSpace}') As "Bytes Free",
        (${allSelect.tableSpacePercentFree}'${tableSpace}') As "Percent Free",
        (${allSelect.tableSpaceStatus}'${tableSpace}') As "Status"
      From dual
      `
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

const findAllInstance = async (req, res) => {
  const dbHost = req.headers.database;
  const dbUser = req.headers.user;
  const dbPass = req.headers.pass;
  let connection;
  try {
    connection = await oracledb.getConnection({
      connectString: dbHost,
      user: dbUser,
      password: dbPass,
    });
    const result = await connection.execute(
      `
      ${allSelect.discUser}
      `
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

const collectInstance = async (req, res) => {
  const dbHost = req.headers.database;
  const dbUser = req.headers.user;
  const dbPass = req.headers.pass;
  const instance = req.body.instance;
  let connection;
  try {
    connection = await oracledb.getConnection({
      connectString: dbHost,
      user: dbUser,
      password: dbPass,
    });

    const result = await connection.execute(
      `
      Select
        (${allSelect.activeUser}'${instance}') as "Active User",
        (${allSelect.dbAlive}'${instance}') as "DB Alive",
        (${allSelect.status}'${instance}') as "Status",
        (${allSelect.dataGuardStatus}'${instance}' AND rownum =1) as "Dataguard Status",
        (${allSelect.dataGuardError}'${instance}' AND ROWNUM = 1) as "Dataguard Msg Error"
      From dual
      `
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

export default {
  findAllMetrics,
  findAllMetrics2,
  findLockWait,
  findAllSelect,
  findAllTableSpace,
  collectTablespace,
  findAllInstance,
  collectInstance,
};
