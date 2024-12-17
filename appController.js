const express = require('express');
const appService = require('./appService');

const router = express.Router();

// email of currently logged in user
loggedInUser = null;

// ----------------------------------------------------------
// API endpoints
router.get('/check-db-connection', async (req, res) => {
  const isConnect = await appService.testOracleConnection();
  if (isConnect) {
      res.send('connected');
  } else {
      res.send('unable to connect');
  }
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).send('Name, email and password are required');
    }

    const registerResult = await appService.registerCollector(name, email, password);
    if (registerResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  const loginResult = await appService.loginCollector(email, password);
  if (loginResult) {
    // record currently logged in user
    loggedInUser = email;
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.put('/logout', async (req, res) => {
  loggedInUser = null;
  res.json({ success: true });
});

// Show logged in user's table of collections (id, name, date created)
router.get('/collection', async (req, res) => {
  if (!loggedInUser) {
    res.status(400).json({data: null});
  } else {
    const tableContent = await appService.fetchCollectionFromDb(loggedInUser);
    res.json({data: tableContent});
  }
});


// deletes a user's collection given a logged in user and a collectionName
router.delete("/delete-collection", async (req, res) => {
    const { collectionName } = req.body;
      if (!loggedInUser) {
        res.status(400).json({data: null});
      } else {
        const deleteResult = await appService.deleteCollection(collectionName, loggedInUser);
        if (deleteResult.success) {
            res.json(deleteResult);
        } else {
            res.status(500).json(deleteResult);
        }
      }

})

// fetches items in specified collection given collection exists in logged in users collections
router.get("/items-in-collection", async (req, res) => {
    const { collectionName } = req.query;

      if (!loggedInUser || !collectionName) {
        res.status(400).json({data: null});
      }

      try {
        const items = await appService.getItemsInCollection(collectionName, loggedInUser);
        res.json({ data : items });
      } catch (error) {
        console.log("Error Fetching items in Collection: ", error);
        res.status(500).json({data: null, error: "Internal sever error"});
      }
})

// fetches collectionName and itemCount for each of the logged in users collections
router.get("/count-items-group-by-collection", async (req, res) => {
       if (!loggedInUser) {
         res.status(400).json({data: null});
       }

       try {
            const result = await appService.countItemsGroupByCollection(loggedInUser);
            res.json({ data : result });
       } catch (error) {
           console.log("Error Counting items in Collections: ", error);
            res.status(500).json({data: null, error: "Internal sever error"});
       }
})

router.post('/insertTradingCard', async (req, res) => {
  const {
      athlete,
      cardVariation,
      sport,
      itemName,
      prevCollectorID,
      seriesName,
      releaseDate,
      manufacturerName,
      country
  } = req.body;

  if (
      !athlete ||
      !cardVariation ||
      !sport ||
      !itemName ||
      !prevCollectorID ||
      !seriesName ||
      !releaseDate ||
      !manufacturerName ||
      !country
  ) {
      return res.status(400).json({ message: 'Missing data' });
  }

  try {
      const result = await appService.insertTradingCard(
          athlete,
          cardVariation,
          sport,
          itemName,
          prevCollectorID,
          seriesName,
          releaseDate,
          manufacturerName,
          country
      );

      if (result) {
          res.status(200).json({ message: 'Trading card inserted successfully' });
      } else {
          res.status(500).json({ message: 'Failed to insert trading card' });
      }
  } catch (error) {
      console.error('Error: ', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/insertCoin', async (req, res) => {
  const {
      currency,
      denomination,
      itemName,
      prevCollectorID,
      seriesName,
      releaseDate,
      manufacturerName,
      country
  } = req.body;

  if (
      !currency ||
      !denomination ||
      !itemName ||
      !prevCollectorID ||
      !seriesName ||
      !releaseDate ||
      !manufacturerName ||
      !country
  ) {
      return res.status(400).json({ message: 'Missing data' });
  }

  try {
      const result = await appService.insertCoin(
          currency,
          denomination,
          itemName,
          prevCollectorID,
          seriesName,
          releaseDate,
          manufacturerName,
          country
      );

      if (result) {
          res.status(200).json({ message: 'Coin inserted successfully' });
      } else {
          res.status(500).json({ message: 'Failed to insert coin' });
      }
  } catch (error) {
      console.error('Error: ', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/selectSeriesAfterDate', async (req, res) => {
  const { releaseDate } = req.query; 

  if (!releaseDate) {
      return res.status(400).json({ message: 'Missing release date' });
  }

  try {
      const series = await appService.selectSeriesAfterDate(releaseDate);

      if (series && series.length > 0) {
          res.status(200).json(series);
      } else {
          res.status(404).json({ message: 'No series found after this date' });
      }
  } catch (error) {
      console.error('Error fetching series:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/selectAuctionHouses', async (req, res) => {
  const { minItems } = req.query; 
 
  if (!minItems) {
      return res.status(400).json({ message: 'Missing minimum number of items' });
  }

  const minItemsParsed = parseInt(minItems, 10);

  if (isNaN(minItemsParsed) || minItemsParsed < 1) {
      return res.status(400).json({ message: 'Minimum items must be a positive integer and greater than 0' });
  }

  try {
      const auctionHouses = await appService.selectAuctionHousesWithMoreThanItems(minItemsParsed);

      if (auctionHouses && auctionHouses.length > 0) {
          res.status(200).json(auctionHouses);
      } else {
          res.status(404).json({ message: 'No auction houses found ' });
      }
  } catch (error) {
      console.error('Error fetching auction houses:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});


// updates item with given itemID only if it is in one of the user's collections
router.put('/update-item', async (req, res) => {
  if (!loggedInUser) {
    res.status(400).json({ success: false });
  } else {
    const { itemID, newItemName, newPrevCollectorID } = req.body;

    const updateResult = await appService.updateItem(loggedInUser, itemID, newItemName, newPrevCollectorID);

    if (updateResult) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  }
});

// project on History, showing only columns that were specified in showCols
router.put('/project-on-history', async (req, res) => {
  const showCols = req.body;
  const projectionTableContent = await appService.projectHistory(showCols);

  if (projectionTableContent) {
    res.json({data: projectionTableContent});
  } else {
    res.status(500).json({ data: [[]] }); // no data found
  }
});

// get valuation for all of user's collections
router.get("/collection-valuations", async (req, res) => {
  if (!loggedInUser) {
    res.status(400).json({success: false, data: null});
  } else {
    const tableContent = await appService.getCollectionValuation(loggedInUser);
    res.json({success: true, data: tableContent});
  }
});

// Returns the auction IDs and names where all items in them are in the given collection
router.put("/auctions-with-collection-items", async (req, res) => {
  try {
    const collectionID = req.body.collectionID;
    const tableContent = await appService.findAuctionsWithAllItemsFromCollection(Number(collectionID));
    res.json({success: true, data: tableContent});
  } catch(err) {
    res.status(500).json({success: false, data: [[]]});
  }
});

module.exports = router;