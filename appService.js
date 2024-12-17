const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolAlias: 'default',
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

// ----------------------------------------------------------
// Domain-specific database operations

async function registerCollector(name, email, password) {
    return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                'SELECT MAX(collectorID) FROM Collector1'
            );

            id = result.rows[0][0];
            collectorID = 1;
            if (id) {
                collectorID = id + 1;
            }

            const result1 = await connection.execute(
              `INSERT INTO Collector1 (collectorID, email) VALUES (:collectorID, :email)`,
              [collectorID, email],
              { autoCommit: true }
            );
        
            const result2 = await connection.execute(
              `INSERT INTO Collector2 (email, collectorName) VALUES (:email, :name)`,
              [email, name],
              { autoCommit: true }
            );
        
            const result3 = await connection.execute(
              `INSERT INTO Collector3 (collectorID, collectorPassword) 
              VALUES ( (SELECT collectorID FROM Collector1 WHERE email = :email), :password )`,
              [email, password],
              { autoCommit: true }
            );
        
            return true;
          }).catch(() => {
            return false;
          });
}

async function loginCollector(email, password) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
          `SELECT collectorPassword 
          FROM Collector1 c1, Collector3 c3 
          WHERE c1.collectorID = c3.collectorID AND email = :email`,
          [email]
        );

        return result.rows[0] == password;
      }).catch(() => {
        return false;
      });
}

async function fetchCollectionFromDb(email) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT collectorID FROM Collector1 WHERE email = :email', [email]);
        id = result.rows[0][0];

        const table = await connection.execute(
            `SELECT c1.collectionID AS ID, c1.collectionName AS Name, c3.dateCreated AS DateCreated
            FROM Collection1 c1, Collection2 c2, Collection3 c3
            WHERE c1.collectionID = c2.collectionID and c2.collectorID = c3.collectorID AND c3.collectorID = :id`,
            [id]
        )
        return table.rows;
    }).catch(() => {
        return [];
    });
}

async function updateItem(email, itemID, newItemName, newPrevCollectorID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT collectorID FROM Collector1 WHERE email = :email', [email]);
        id = result.rows[0][0];

        itemID = parseInt(itemID, 10);
        if (!newItemName) {
            const currItemName = await connection.execute(
                `SELECT itemName
                FROM Item
                WHERE itemID = :itemID`,
                [itemID]
            )
            newItemName = currItemName.rows[0][0];
        }

        if (!newPrevCollectorID) {
            const currPrevCollectorID = await connection.execute(
                `SELECT prevCollectorID
                FROM Item
                WHERE itemID = :itemID`,
                [itemID]
            )
            newPrevCollectorID = currPrevCollectorID.rows[0][0];
        } else if (newPrevCollectorID != null) {
            newPrevCollectorID = parseInt(newPrevCollectorID, 10);
            if (newPrevCollectorID < 1) {
                newPrevCollectorID = null;
            }
        }

        const update = await connection.execute(
            `UPDATE Item
            SET itemName = :newItemName, prevCollectorID = :newPrevCollectorID
            WHERE itemID = :itemID AND EXISTS (
                SELECT p.itemID AS iid
                FROM Partof p
                WHERE p.itemID = :itemID AND p.collectionID = ANY (
                    SELECT collectionID
                    FROM Collection2
                    WHERE collectorID = :id))`,
            {
                id: id,
                newItemName: newItemName,
                newPrevCollectorID: newPrevCollectorID,
                itemID: itemID
            },
            { autoCommit: true }
        );

        // false if item was ineligible to be updated, so wasn't updated (not in user's collection)
        return update.rowsAffected != 0;
    }).catch(() => {
        return false;
    });
}

async function insertTradingCard(athlete, cardVariation, sport, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT MAX(itemID) FROM Item`
            );

            let itemID = 1;
            if(result.rows[0][0]) {
                itemID = result.rows[0][0] + 1;
            }

            await connection.execute(
                `INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country) 
                VALUES(:itemID, :itemName, :prevCollectorID, :seriesName, TO_DATE(:releaseDate, 'YYYY-MM-DD'), :manufacturerName, :country)`,
                {
                    itemID: itemID,
                    itemName: itemName,
                    prevCollectorID: prevCollectorID,
                    seriesName: seriesName,
                    releaseDate: releaseDate,
                    manufacturerName: manufacturerName,
                    country: country
                },
                {autoCommit: true}
            );

            await connection.execute(
                `INSERT INTO TradingCard1(itemID, athlete) VALUES(:itemID, :athlete)`,
                {
                    itemID: itemID,
                    athlete: athlete
                },
                {autoCommit: true}
            );

            await connection.execute(
                `INSERT INTO TradingCard2(itemID, cardVariation) VALUES(:itemID, :cardVariation)`,
                {
                    itemID: itemID,
                    cardVariation: cardVariation
                },
                {autoCommit: true}
            );

            await connection.execute(
                `INSERT INTO TradingCard3(athlete, sport) VALUES(:athlete, :sport)`,
                {
                    athlete: athlete,
                    sport: sport
                },
                {autoCommit: true}
            );

            console.log(`Successfully inserted trading card: ${athlete}`);
            return true;
        } catch(error) {
            console.error("Error inserting trading card: ", error);
            return false;
        }
    })
}

async function insertCoin(currency, denomination, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT MAX(itemID) FROM Item`
            );

            let itemID = 1;
            if(result.rows[0][0]) {
                itemID = result.rows[0][0] + 1;
            }

            await connection.execute(
                `INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country) 
                VALUES(:itemID, :itemName, :prevCollectorID, :seriesName, TO_DATE(:releaseDate, 'YYYY-MM-DD'), :manufacturerName, :country)`,
                {
                    itemID: itemID,
                    itemName: itemName,
                    prevCollectorID: prevCollectorID,
                    seriesName: seriesName,
                    releaseDate: releaseDate,
                    manufacturerName: manufacturerName,
                    country: country
                },
                {autoCommit: true}
            );

            await connection.execute(
                `INSERT INTO Coin(itemID, currency, denomination) VALUES(:itemID, :currency, :denomination)`,
                {
                    itemID: itemID,
                    currency: currency,
                    denomination: denomination
                },
                {autoCommit: true}
            );
            
            console.log(`Successfully inserted coin: ${currency} with amount ${denomination}`);
            return true;
        } catch(error) {
            console.error("Error inserting coin: ", error);
            return false;
        }
    })
}

async function selectSeriesAfterDate(releaseDate) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT * 
                 FROM Series 
                 WHERE releaseDate > TO_DATE(:releaseDate, 'YYYY-MM-DD')`,
                {
                    releaseDate : releaseDate
                }
            );

            if (result.rows.length > 0) {
                console.log('Series after the specified date:', result.rows);
                return result.rows;  
            } else {
                console.log('No series found after the specified date.');
                return [];
            }
        } catch (error) {
            console.error("Error fetching series: ", error);
            return false; 
        }
    });
}

async function selectAuctionHousesWithMoreThanItems(minItems) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT Auction1.auctionHouse, COUNT(Includes.itemID) AS totalItems
                 FROM Auction1
                 JOIN Includes ON Auction1.auctionID = Includes.auctionID
                 GROUP BY Auction1.auctionHouse
                 HAVING COUNT(Includes.itemID) >= :minItems`,
                {
                    minItems: minItems 
                }
            );

            if (result.rows.length > 0) {
                console.log('Auction houses with more than the specified items:', result.rows);
                return result.rows;  
            } else {
                console.log('No auction houses found with more than or equal to the specified number of items.');
                return [];
            }
        } catch (error) {
            console.error("Error fetching auction houses: ", error);
            return false; 
        }
    });
}

async function deleteCollection(collectionName, currentCollectorEmail) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                 `DELETE FROM Collection1
                 WHERE collectionName = :collectionName
                 AND collectionID IN (
                     SELECT collectionID FROM Collection2
                     WHERE collectorID = (
                         SELECT collectorID FROM Collector1 WHERE email = :email
                     )
                 )`,
                {
                    collectionName: collectionName,
                    email: currentCollectorEmail
                },
                { autoCommit: true }
            );

            // Check if rows are affected
            if (result.rowsAffected === 0) {
                return { success: false, message: "No collection was found or Collector not authorized to delete this." };
            }

            return { success: true, message: "Collection deleted successfully!" };
        } catch (error) {
            console.error("Error deleting collection:", error.message);
            return { success: false, message: "Error when deleting collection." };
        }
    });
}

// fetch items in a collection given collection name specified by user.
async function getItemsInCollection(collectionName, currentCollectorEmail) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT
                    item.itemID, item.itemName, item.seriesName, item.releaseDate, item.manufacturerName, item.country
                 FROM
                    Collector1 collector1
                 JOIN
                    Collection2 collection2 ON collector1.collectorID = collection2.collectorID
                 JOIN
                    Collection1 collection1 ON collection2.collectionID = collection1.collectionID
                 JOIN
                    PartOf partOf ON collection1.collectionID = partOf.collectionID
                 JOIN
                    Item item ON partOf.itemID = item.itemID
                 WHERE
                    collector1.email = :email  AND
                    collection1.collectionName = :collectionName`,
                {
                    collectionName: collectionName,
                    email: currentCollectorEmail
                }
            );

            return result.rows;
        } catch (error) {
            console.error("Error fetching items in given collection:", error.message);
            return [];
        }
    });
}

// count items in each collection
async function countItemsGroupByCollection(currentCollectorEmail) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT
                    Collection1.collectionName, COUNT(PartOf.itemID) AS itemCount
                 FROM
                    Collection1
                 JOIN
                    Collection2 ON Collection1.collectionID = Collection2.collectionID
                 JOIN
                    Collector1 ON Collection2.collectorID = Collector1.collectorID
                 JOIN
                    PartOf ON Collection1.collectionID = PartOf.collectionID
                 WHERE
                    Collector1.email = :email
                 GROUP BY
                    Collection1.collectionName
                 `,
                {
                    email: currentCollectorEmail
                }
            );

            return result.rows;
        } catch (error) {
            console.error("Error counting items grouped by collection:", error.message);
            return [];
        }
    });
}


// projection on history - all columns available for projection
async function projectHistory(showCols) {
    return await withOracleDB(async (connection) => {
        const projectionColumnsString = showCols.toString();
        const table = await connection.execute(`SELECT ${projectionColumnsString} FROM History`);
        
        return table.rows;
    }).catch(() => {
        return [[]];
    });
}

// find total valuation for all collections
async function getCollectionValuation(email) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT collectorID FROM Collector1 WHERE email = :email', [email]);
        collectorID = result.rows[0][0];

        const table = await connection.execute(
            `SELECT c2.collectionID, c3.collectionName,
                SUM(
                    (SELECT AVG(v.appraisalValue)
                    FROM Valuation v
                    WHERE v.itemID IN (
                        SELECT p.itemID
                        FROM PartOf p
                        WHERE p.collectionID = c2.collectionID
                    )
                    )
                )
            FROM Collection2 c2, Collection3 c3
            WHERE c3.collectorID = :collectorID AND c2.collectorID = :collectorID
            GROUP BY c2.collectionID, c3.collectionName
            HAVING SUM(
                (SELECT AVG(v.appraisalValue)
                FROM Valuation v
                WHERE v.itemID IN (
                    SELECT p.itemID
                    FROM PartOf p
                    WHERE p.collectionID = c2.collectionID
                )
                )
            ) IS NOT NULL`,
            [collectorID]
        )

        return table.rows;
      }).catch(() => {
        return [[]];
      });
}

// returns IDs and names of all auctions where all items from given collection are in that auction
async function findAuctionsWithAllItemsFromCollection(collectionID) {
    return await withOracleDB(async (connection) => {
        console.log(typeof collectionID + " " + collectionID)
        const table = await connection.execute(
            `SELECT auctionID, auctionHouse
            FROM Auction1 a
            WHERE NOT EXISTS 
                ((SELECT p.itemID
                FROM PartOf p, Collection2 c
                WHERE c.collectionID = TO_NUMBER(:cid) AND p.collectionID = c.collectionID)
                MINUS 
                (SELECT inc.itemid
                FROM Includes inc
                WHERE inc.auctionID = a.auctionID ))`,
            {
                cid: collectionID
            }
        )

        console.log(table);

        return table.rows;
      }).catch(() => {
        return [[]];
      });
}


module.exports = {
    testOracleConnection,
    registerCollector,
    loginCollector,
    fetchCollectionFromDb,
    deleteCollection,
    getItemsInCollection,
    countItemsGroupByCollection,
    insertTradingCard,
    insertCoin,
    updateItem,
    projectHistory,
    selectSeriesAfterDate,
    getCollectionValuation,
    selectAuctionHousesWithMoreThanItems,
    findAuctionsWithAllItemsFromCollection
};