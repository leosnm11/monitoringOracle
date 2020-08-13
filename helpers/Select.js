// Discovery Oracle

const discTableSpace =
  "SELECT d.tablespace_name AS \"{#TSNAME}\", d.block_size AS \"{#BSIZE}\", ddf.autoextend_flag as \"{#AUTOEXT}\" FROM dba_tablespaces d, (SELECT tablespace_name, SUM (BYTES) BYTES, SUM (GREATEST (maxbytes, BYTES)) maxbytes, COUNT (1) antall, MAX(autoextensible) autoextend_flag FROM dba_data_files GROUP BY tablespace_name) ddf WHERE d.tablespace_name = ddf.tablespace_name(+) AND d.bigfile='NO' AND NOT (d.extent_management LIKE 'LOCAL' AND d.CONTENTS LIKE 'TEMPORARY') and d.tablespace_name not like '%UNDO%'";

const discUser = 'select instance_name as "{#INST_NAME}" from gv$instance';

// Metricas padrões

const allMetrics = `
  SELECT
    (select round(A.LOGS*B.AVG/1024/1024/10) from ( SELECT COUNT (*)  LOGS FROM V$LOG_HISTORY WHERE FIRST_TIME >= (sysdate -10/60/24)) A, ( SELECT Avg(BYTES) AVG,  Count(1), Max(BYTES) Max_Bytes, Min(BYTES) Min_Bytes  FROM  v$log) B) as "Archive log",
    (SELECT SUM(DECODE(name,'db block gets', value,0)) FROM v$sysstat) as "DB Block Gets",
    (SELECT SUM(DECODE(name,'consistent gets', value,0)) FROM v$sysstat) as "DB Consistent Gets",
    (SELECT ROUND((( SUM(DECODE(name,'consistent gets', value,0)) + SUM(DECODE(name,'db block gets', value,0)) - SUM(DECODE(name,'physical reads', value,0))) / (SUM(DECODE(name,'consistent gets', value,0)) + SUM(DECODE(name,'db block gets', value,0)) ) * 100),2) as "DB Hit Ratio" FROM v$sysstat) as "DB Hit Ratio",
    (SELECT SUM(DECODE(name,'physical reads', value,0)) FROM v$sysstat) as "DB Physical Reads",
    (SELECT banner from v$version where rownum = 1) as "Database Version",
    (SELECT ROUND(gethitratio*100,2) FROM v$librarycache WHERE namespace ='BODY') as "Hit ratio BODY",
    (SELECT ROUND(gethitratio*100,2) FROM v$librarycache WHERE namespace ='SQL AREA') as "Hit ratio SQLAREA",
    (SELECT ROUND(gethitratio*100,2) FROM v$librarycache WHERE namespace = 'TABLE/PROCEDURE') as "Hit ratio TABLE_PROCEDURE",
    (SELECT * FROM (SELECT ROUND(gethitratio*100,2) FROM v$librarycache WHERE namespace ='TRIGGER' UNION ALL select 0 from dual) WHERE rownum = 1) as "Hit ratio TRIGGER",
    (SELECT SUM(DECODE(NAME,'db block changes',VALUE,0))  FROM V$SYSSTAT WHERE NAME ='db block changes') as "L IO Block Change",
    (SELECT SUM(DECODE(name,'consistent gets',value,0)) FROM V$SYSSTAT WHERE NAME ='consistent gets') as "L IO Consinstent Read",
    (SELECT SUM(DECODE(name,'db block gets',value,0)) FROM V$SYSSTAT WHERE NAME ='db block gets') as "L IO Current Read",
    (SELECT round(sum(bytes)/1024/1024/1024 ,2) from dba_segments) as "Logical DB Size (GB)",
    (SELECT value FROM v$parameter WHERE name ='processes')  As "Max Processes",
    (SELECT value FROM v$parameter WHERE name ='sessions') as "Max Sessions",
    (SELECT SUM(misses) FROM V$LATCH) as "Miss Latch",
    (SELECT value FROM V$PGASTAT WHERE name IN 'total PGA inuse')  as "PGA",
    (SELECT value  FROM V$PGASTAT WHERE name IN 'aggregate PGA target parameter') as "PGA Aggregate target",
    (SELECT SUM(DECODE(name,'physical reads direct',value,0)) FROM V$SYSSTAT WHERE name ='physical reads direct') as "PH IO Datafile Reads",
    (SELECT SUM(DECODE(name,'physical writes direct',value,0)) FROM V$SYSSTAT WHERE name ='physical writes direct')  as  "PH IO Datafile Writes",
    (SELECT SUM(DECODE(name,'redo writes',value,0)) FROM V$SYSSTAT WHERE name ='redo writes') as "PH IO Redo Writes",
    (SELECT ROUND(pins/(pins+reloads)*100,2) FROM v$librarycache WHERE namespace ='BODY') as "Pin hit ratio BODY",
    (SELECT ROUND(pins/(pins+reloads)*100,2) FROM v$librarycache WHERE namespace ='SQL AREA')  as "Pin hit ratio SQLAREA",
    (SELECT ROUND(pins/(pins+reloads)*100,2) FROM v$librarycache WHERE namespace ='TABLE/PROCEDURE') as "Pin hit ratio TABLE_PROCEDURE",
    (SELECT * FROM (SELECT ROUND(pins/(pins+reloads)*100,2) FROM v$librarycache WHERE namespace ='TRIGGER' UNION ALL select 0 from dual) WHERE rownum = 1) as "Pin hit ratio TRIGGER",
    (SELECT SUM(DECODE(pool,'shared pool',DECODE(name,'dictionary cache',bytes,0),0)) FROM V$SGASTAT) as "Pool dict cache",
    (SELECT SUM(DECODE(pool,'shared pool',DECODE(name,'free memory',bytes,0),0)) FROM V$SGASTAT) as "Pool free mem",
    (SELECT SUM(DECODE(pool,'shared pool',DECODE(name,'library cache',bytes,0),0)) FROM V$SGASTAT) as "Pool lib cache",
    (SELECT SUM(DECODE(pool,'shared pool',DECODE(name,'library cache',0,'dictionary cache',0,'free memory',0,'sql area', 0,bytes),0)) FROM V$SGASTAT) as "Pool misc",
    (SELECT SUM(DECODE(pool,'shared pool',DECODE(name,'sql area',bytes,0),0)) FROM V$SGASTAT) as "Pool sql area",
    (SELECT COUNT(*) FROM v$process) as "Processes",
    (SELECT COUNT(*) FROM v$session WHERE TYPE!='BACKGROUND' AND status='ACTIVE') as "Session Active",
    (SELECT SUM(DECODE(Type, 'BACKGROUND', 0, DECODE(Status, 'ACTIVE', 0, 1))) FROM V$SESSION) as "Session Inactive",
    (SELECT SUM(DECODE(Type, 'BACKGROUND', 1, 0)) FROM V$SESSION) as "Session System",
    (SELECT TO_CHAR((sysdate-startup_time)*86400, 'FM99999999999999990') FROM v$instance) as "Uptime",
    (SELECT COUNT(username) FROM v$session WHERE username IS NOT NULL) as "Users Connected",
    (SELECT sum((almax-lhmax)) FROM (select thread# thrd, MAX(sequence#) almax FROM v$archived_log WHERE resetlogs_change#=(SELECT resetlogs_change# FROM v$database) GROUP BY thread#) al, (SELECT thread# thrd, MAX(sequence#) lhmax FROM v$log_history WHERE resetlogs_change#=(SELECT resetlogs_change# FROM v$database) GROUP BY thread#) lh WHERE al.thrd = lh.thrd) as "DataguardGap",
    (select count(*) from dba_objects o where status != 'VALID' and not exists (select 1 from dba_snapshots s where s.name = o.object_name and s.status ='VALID') and o.object_name not like 'BIN$%' and o.object_type <> 'SYNONYM') as "Object Invalid",
    (select round ((space_used/space_limit)*100,2) from v$recovery_file_dest) as "FlashRecovery",
    (SELECT ROUND((SUM(DECODE(NAME, 'table scans (long tables)', VALUE, 0))/ (SUM(DECODE(NAME, 'table scans (long tables)', VALUE, 0))+SUM(DECODE(NAME, 'table scans (short tables)', VALUE, 0)))*100),3) FROM V$SYSSTAT WHERE 1     =1 AND ( NAME IN ('table scans (long tables)','table scans (short tables)') )) as "SQL Query Not Indexed",
    (SELECT SUM(DECODE(event,'control file sequential read', total_waits, 'control file single write', total_waits, 'control file parallel write',total_waits,0)) FROM V$system_event WHERE 1 =1 AND event NOT IN ( 'SQL*Net message from client', 'SQL*Net more data from client','pmon timer', 'rdbms ipc message', 'rdbms ipc reply', 'smon timer')) as "Waits Controlfile IO",
    (SELECT SUM(DECODE(event,'direct path read',total_waits,0)) FROM V$system_event WHERE 1 =1 AND event NOT IN ( 'SQL*Net message from ', 'SQL*Net more data from client','pmon timer', 'rdbms ipc message', 'rdbms ipc reply', 'smon timer')) as "Waits direct path read",
    (SELECT SUM(DECODE(event,'file identify',total_waits, 'file open',total_waits,0)) FROM V$system_event WHERE 1 =1 AND event NOT IN ( 'SQL*Net message from client', 'SQL*Net more data from client', 'pmon timer', 'rdbms ipc message', 'rdbms ipc reply', 'smon timer')) as "Waits File IO",
    (SELECT SUM(DECODE(event,'control file sequential read', total_waits, 'control file single write', total_waits, 'control file parallel write',total_waits,0)) FROM V$system_event WHERE 1 =1 AND event NOT IN ( 'SQL*Net message from client', 'SQL*Net more data from client', 'pmon timer', 'rdbms ipc message', 'rdbms ipc reply', 'smon timer')) as "Waits latch",
    (SELECT SUM(DECODE(event,'log file single write',total_waits, 'log file parallel write',total_waits,0)) FROM V$system_event WHERE 1=1 AND event NOT IN ( 'SQL*Net message from client', 'SQL*Net more data from client', 'pmon timer', 'rdbms ipc message', 'rdbms ipc reply', 'smon timer')) as "Waits Logwrite",
    (SELECT SUM(DECODE(event,'db file scattered read',total_waits,0)) FROM V$system_event WHERE 1=1 AND event NOT IN ( 'SQL*Net message from client', 'SQL*Net more data from client', 'pmon timer', 'rdbms ipc message', 'rdbms ipc reply', 'smon timer')) as "Waits multiblock read",
    (SELECT SUM(DECODE(event,'control file sequential read',0,'control file single write',0,'control file parallel write',0,'db file sequential read',0,'db file scattered read',0,'direct path read',0,'file identify',0,'file open',0,'SQL*Net message to client',0,'SQL*Net message to dblink',0, 'SQL*Net more data to client',0,'SQL*Net more data to dblink',0, 'SQL*Net break/reset to client',0,'SQL*Net break/reset to dblink',0, 'log file single write',0,'log file parallel write',0,total_waits)) FROM V$system_event WHERE 1=1 AND event NOT IN ( 'SQL*Net message from client', 'SQL*Net more data from client', 'pmon timer', 'rdbms ipc message', 'rdbms ipc reply', 'smon timer'))  as "Waits others",
    (SELECT SUM(DECODE(event,'db file sequential read',total_waits,0)) FROM V$system_event WHERE 1 =1 AND event NOT IN ( 'SQL*Net message from client', 'SQL*Net more data from client', 'pmon timer', 'rdbms ipc message', 'rdbms ipc reply', 'smon timer'))  as "Waits single block read",
    (SELECT SUM(DECODE(event,'SQL*Net message to client',total_waits,'SQL*Net message to dblink',total_waits,'SQL*Net more data to client',total_waits,'SQL*Net more data to dblink',total_waits,'SQL*Net break/reset to client',total_waits,'SQL*Net break/reset to dblink',total_waits,0)) FROM V$system_event WHERE 1=1 AND event NOT IN ( 'SQL*Net message from client','SQL*Net more data from client','pmon timer','rdbms ipc message','rdbms ipc reply', 'smon timer')) as "Waits SQLNet",
    (SELECT SUM(DECODE(pool,NULL,DECODE(name,'db_block_buffers',(bytes),'buffer_cache',bytes,0),0)) FROM V$SGASTAT) as "SGA buffer cache",
    (SELECT SUM(DECODE(pool,NULL,DECODE(name,'fixed_sga',bytes,0),0)) FROM V$SGASTAT) as "SGA fixed",
    (SELECT SUM(DECODE(pool,'java pool',bytes,0)) FROM V$SGASTAT) as "SGA java pool",
    (SELECT SUM(DECODE(pool,'large pool',bytes,0)) FROM V$SGASTAT) as "SGA large pool",
    (SELECT SUM(DECODE(pool,NULL,DECODE(name,'log_buffer',bytes,0),0)) FROM V$SGASTAT) as "SGA log buffer",
    (SELECT SUM(DECODE(pool,'shared pool',DECODE(name,'library cache',0,'dictionary cache',0,'free memory',0,'sql area',0,bytes),0)) FROM V$SGASTAT) as "SGA shared pool"
  FROM DUAL
  `;
const allMetrics2 = `
     (SELECT  username || ' ' || lock_date || ' ' || account_status as "Locked" FROM dba_users where ACCOUNT_STATUS like 'EXPIRED(GRACE)' or ACCOUNT_STATUS like 'LOCKED(TIMED)' union select 'none' from dual where not exists ( SELECT username  FROM dba_users where ACCOUNT_STATUS like 'EXPIRED(GRACE)' or ACCOUNT_STATUS like 'LOCKED(TIMED)'))
  `;

const allLockWait = `SELECT LISTAGG(locks, ',') WITHIN GROUP (ORDER BY dummy) AS "Locks wait" FROM (SELECT 'dummy' AS dummy, ' ' || sn.USERNAME ||'@' ||sn.machine ||'|SID->' ||m.SID ||'|Serial->'  ||sn.SERIAL# ||'|Lock Type->' ||m.TYPE ||DECODE(LMODE, 1, 'Null', 2, 'Row-S (SS)', 3, 'Row-X (SX)', 4, 'Share', 5, 'S/Row-X (SSX)', 6, 'Exclusive') ||DECODE(REQUEST, 0, 'None', 1, 'Null', 2, 'Row-S (SS)', 3, 'Row-X (SX)', 4, 'Share', 5, 'S/Row-X (SSX)', 6, 'Exclusive') ||'|Time (Sec)->' ||m.CTIME ||'|ID1->' ||m.ID1 ||'|ID2->' ||m.ID2 ||'|SQL Text->' ||t.SQL_TEXT AS locks FROM v$session sn, v$lock m , v$sqltext t WHERE t.ADDRESS  =sn.SQL_ADDRESS  AND t.HASH_VALUE =sn.SQL_HASH_VALUE  AND ((sn.SID     =m.SID  AND m.REQUEST   !=0)  OR (sn.SID       =m.SID  AND m.REQUEST    =0    AND LMODE       !=4  AND (ID1, ID2)  IN   (SELECT s.ID1,  s.ID2  FROM v$lock S  WHERE REQUEST !=0 AND s.ctime    > 5  AND s.ID1      =m.ID1 AND s.ID2      =m.ID2 )))  ) GROUP BY dummy`;
// Coleta da TableSpace

const tableSpacePercentUsed =
  'select  round(((a.BYTES-b.BYTES)/a.BYTES)*100,2)  from ( select  TABLESPACE_NAME, sum(BYTES) BYTES from     dba_data_files group   by TABLESPACE_NAME) a, ( select  TABLESPACE_NAME, sum(BYTES) BYTES , max(BYTES) largest from dba_free_space group   by TABLESPACE_NAME ) b where   a.TABLESPACE_NAME=b.TABLESPACE_NAME and a.TABLESPACE_NAME=';
const tableSpaceBytesUsed =
  'select  a.BYTES from ( select  TABLESPACE_NAME, sum(BYTES) BYTES from     dba_data_files group   by TABLESPACE_NAME) a, ( select  TABLESPACE_NAME, sum(BYTES) BYTES , max(BYTES) largest from     dba_free_space group   by TABLESPACE_NAME ) b where   a.TABLESPACE_NAME=b.TABLESPACE_NAME and a.TABLESPACE_NAME=';
const tableSpaceStatus =
  "select decode(STATUS, 'ONLINE',1,0) from dba_tablespaces where TABLESPACE_NAME =";
const tableSpaceFree =
  'select  b.BYTES from ( select  TABLESPACE_NAME, sum(BYTES) BYTES from dba_data_files group by TABLESPACE_NAME) a, ( select  TABLESPACE_NAME, sum(BYTES) BYTES , max(BYTES) largest from     dba_free_space group   by TABLESPACE_NAME ) b where   a.TABLESPACE_NAME=b.TABLESPACE_NAME and a.TABLESPACE_NAME=';
const tableSpacePercentFree =
  'select round(( (df.totalspace - tu.totalusedspace)/ df.totalspace)* 100,2) from (select tablespace_name, round(sum(bytes) / 1048576) TotalSpace from dba_data_files group by tablespace_name) df, (select round(sum(bytes)/(1024*1024)) totalusedspace, tablespace_name from dba_segments group by tablespace_name) tu where df.tablespace_name = tu.tablespace_name and df.tablespace_name=';

//   Coleta por instancia

const activeUser =
  "SELECT nvl(resultAU.activeUsers,0) as \"Active Users\" from gv$instance Left outer join (SELECT  gv$instance.inst_id as instanceID,COUNT(gv$session.username) as activeUsers FROM gv$session,gv$instance WHERE gv$session.username NOT IN('SYS','SYSTEM') and gv$session.status = 'ACTIVE' AND gv$instance.inst_id=gv$session.inst_id group by gv$instance.inst_id) resultAU on gv$instance.inst_id = resultAU.instanceID where gv$instance.instance_name = ";

const dbAlive =
  'SELECT STATUS as "DB Alive" from gv$instance where INSTANCE_NAME like ';

const status =
  'SELECT NVL(database_status,\'INATIVE\') AS "Instance Status" from gv$instance where instance_name = ';

const dataGuardStatus =
  "SELECT DECODE(a.status,'VALID',1,0) as \"Dataguard Status\"  FROM GV$ARCHIVE_DEST a,gv$instance WHERE a.status <> 'INACTIVE' AND gv$instance.inst_id=a.inst_id and gv$instance.instance_name = ";

const dataGuardError =
  "SELECT decode(a.error,null,'NULL', a.error) as \"Dataguard Msg Error\" FROM GV$ARCHIVE_DEST a,gv$instance WHERE a.status <> 'INACTIVE' AND gv$instance.inst_id=a.inst_id and gv$instance.instance_name = ";

export default {
  allMetrics,
  allMetrics2,
  allLockWait,
  discUser,
  discTableSpace,
  tableSpacePercentUsed,
  tableSpaceBytesUsed,
  tableSpaceStatus,
  tableSpaceFree,
  tableSpacePercentFree,
  activeUser,
  dbAlive,
  status,
  dataGuardStatus,
  dataGuardError,
};
