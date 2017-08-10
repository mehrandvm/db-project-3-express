import {Client, QueryResult} from 'pg';
import * as dbUtil from './../utils/dbUtil';
import logger = require('./../utils/logger');
const transactionSuccess : string = 'transaction success';

/* 
 * sample query
 * @return server time
 */
export let getTimeModel = (callback:Function) => {
    let sql = "SELECT NOW()";
    let data : string[][] = [];
    dbUtil.sqlToDB(sql, data, function(err:Error, result:Object){
        if (err){
            logger.error(`getTime() error: ${err}`);  
            callback(err);
        } else {
            callback(null, result);
        }
    }); 
}

/* 
 * sample query using transactions
 * @return transaction success
 */
export let sampleTransactionModel = (callback:Function) => {
    let singleSql = "DELETE FROM TEST";
    let multiSql = "INSERT INTO TEST (testcolumn) VALUES ($1)";
    let singleData : string[][] = [];
    let multiData : string[][] = [['typescript'], ['is'], ['fun']];
    dbUtil.getTransaction(function(err:Error, client:Client, done:Function) {
        if (err) {
            logger.error(`sampleTransaction() error: ${err}`);
            callback(err);
        } else {
            dbUtil.sqlExecSingleRow(client, singleSql, singleData, function(err:Error, dbResult:QueryResult){
                if (err) {
                    logger.error(`sampleTransaction() sqlExecSingleRow() error: ${err}`);
                    done();
                    callback(err);
                } else {
                    dbUtil.sqlExecMultipleRows(client, multiSql, multiData, function (err:Error, dbResult:QueryResult) {                
                        if (err) {
                            dbUtil.rollback(client, done);
                            callback(err);
                        } else {
                            dbUtil.commit(client, done);
                            logger.info(`sampleTransaction success`);
                            callback(null, transactionSuccess);
                        }
                    });
                }
            });
        }
    }); 
}
