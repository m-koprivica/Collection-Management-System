-- DROP statements

DROP TABLE Valuation;
DROP TABLE Appraiser;
DROP TABLE Coin;
DROP TABLE TradingCard3;
DROP TABLE TradingCard2;
DROP TABLE TradingCard1;
DROP TABLE Includes;
DROP TABLE Participates;
DROP TABLE PartOf;
DROP TABLE Item;
DROP TABLE History;
DROP TABLE Manufacturer;
DROP TABLE Series;
DROP TABLE Auction2;
DROP TABLE Auction1;
DROP TABLE Collection3;
DROP TABLE Collection2;
DROP TABLE Collection1;
DROP TABLE Collector3;
DROP TABLE Collector2;
DROP TABLE Collector1;

-- CREATE TABLE statements

CREATE TABLE Collector1 (
    collectorID INTEGER PRIMARY KEY,
    email VARCHAR(255) UNIQUE
);

CREATE TABLE Collector2 (
	email VARCHAR(255) PRIMARY KEY,
	collectorName VARCHAR(255),
	FOREIGN KEY (email) REFERENCES Collector1(email)
		ON DELETE CASCADE
);

CREATE TABLE Collector3 (
	collectorID INTEGER PRIMARY KEY,
	collectorPassword VARCHAR(255) NOT NULL,
	FOREIGN KEY (collectorID) REFERENCES Collector1(collectorID)
		ON DELETE CASCADE
);

CREATE TABLE Collection1 (
    collectionID INTEGER PRIMARY KEY,
    collectionName VARCHAR(255)
);

CREATE TABLE Collection2 (
    collectionID INTEGER PRIMARY KEY,
    collectorID INTEGER NOT NULL,
    FOREIGN KEY (collectionID) REFERENCES Collection1(collectionID)
        ON DELETE CASCADE,
    FOREIGN KEY (collectorID) REFERENCES Collector1(collectorID)
        ON DELETE CASCADE
);

CREATE TABLE Collection3 (
    collectorID INTEGER,
    collectionName VARCHAR(255),
    dateCreated DATE,
    PRIMARY KEY (collectorID, collectionName),
    FOREIGN KEY (collectorID) REFERENCES Collector1(collectorID)
        ON DELETE CASCADE
);

CREATE TABLE Auction1 (
    auctionID INTEGER PRIMARY KEY,
    auctionHouse VARCHAR(255) UNIQUE
);

CREATE TABLE Auction2 (
    auctionHouse VARCHAR(255) PRIMARY KEY,
    auctionLocation VARCHAR(255),
    FOREIGN KEY(auctionHouse) REFERENCES Auction1(auctionHouse)
        ON DELETE CASCADE
);


CREATE TABLE Series (
    seriesName VARCHAR(255),
    releaseDate DATE,
    editionNumber INTEGER,
    PRIMARY KEY (seriesName, releaseDate)
);

CREATE TABLE Manufacturer (
    manufacturerName VARCHAR(255),
    country VARCHAR(255),
    yearEstablished INTEGER,
    PRIMARY KEY (manufacturerName,country)
);

CREATE TABLE History (
    prevCollectorID INTEGER PRIMARY KEY,
    prevCollectorName VARCHAR(255),
    acquireDate DATE,
    sellDate DATE,
    priceSold FLOAT
);


CREATE TABLE Item (
    itemID INTEGER PRIMARY KEY,
    itemName VARCHAR(255),
    prevCollectorID INTEGER,
    seriesName VARCHAR(255) NOT NULL,
    releaseDate DATE NOT NULL,
    manufacturerName VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    FOREIGN KEY (prevCollectorID) REFERENCES History(prevCollectorID),
    FOREIGN KEY (seriesName, releaseDate) REFERENCES Series(seriesName, releaseDate)
        ON DELETE CASCADE,
    FOREIGN KEY (manufacturerName, country) REFERENCES Manufacturer(manufacturerName, country)
        ON DELETE CASCADE
);

CREATE TABLE TradingCard1 (
    itemID INTEGER PRIMARY KEY,
    athlete VARCHAR(255) UNIQUE,
    FOREIGN KEY (itemID) REFERENCES Item(itemID)
        ON DELETE CASCADE
);

CREATE TABLE TradingCard2 (
    itemID INTEGER PRIMARY KEY,
    cardVariation VARCHAR(255),
    FOREIGN KEY (itemID) REFERENCES TradingCard1(itemID)
        ON DELETE CASCADE
);

CREATE TABLE TradingCard3 (
    athlete VARCHAR(255) PRIMARY KEY,
    sport VARCHAR(255),
    FOREIGN KEY (athlete) REFERENCES TradingCard1(athlete)
        ON DELETE CASCADE
);

CREATE TABLE Coin (
    itemID INTEGER PRIMARY KEY,
    currency VARCHAR(255),
    denomination FLOAT,
    FOREIGN KEY (itemID) REFERENCES Item(itemID)
        ON DELETE CASCADE
);

CREATE TABLE Appraiser (
    appraiserID INTEGER PRIMARY KEY,
    appraiserName VARCHAR(255) NOT NULL
);

CREATE TABLE Valuation (
    appraiserID INTEGER,
    itemID INTEGER,
    appraisalValue FLOAT,
    condition VARCHAR(255),
    PRIMARY KEY (appraiserID, itemID),
    FOREIGN KEY (itemID) REFERENCES Item(itemID)
        ON DELETE CASCADE,
    FOREIGN KEY (appraiserID) REFERENCES Appraiser(appraiserID)
);

CREATE TABLE Participates (
    collectorID INTEGER,
    auctionID INTEGER,
    participationDate DATE,
    PRIMARY KEY (collectorID, auctionID),
    FOREIGN KEY (collectorID) REFERENCES Collector1(collectorID)
        ON DELETE CASCADE,
    FOREIGN KEY (auctionID) REFERENCES Auction1(auctionID)
        ON DELETE CASCADE
);


CREATE TABLE Includes (
    auctionID INTEGER,
    itemID INTEGER,
    PRIMARY KEY (auctionID, itemID),
    FOREIGN KEY (auctionID) REFERENCES Auction1(auctionID)
        ON DELETE CASCADE,
    FOREIGN KEY (itemID) REFERENCES Item(itemID)
        ON DELETE CASCADE
);

CREATE TABLE PartOf (
    itemID INTEGER,
    collectionID INTEGER,
    PRIMARY KEY (itemID, collectionID),
    FOREIGN KEY (itemID) REFERENCES Item(itemID)
        ON DELETE CASCADE,
    FOREIGN KEY (collectionID) REFERENCES Collection1(collectionID)
        ON DELETE CASCADE
);

-- INSERT tuples

INSERT INTO Collector1 (collectorID, email) VALUES (1, 'joe@yahoo.com');
INSERT INTO Collector1 (collectorID, email) VALUES (2, 'jim@gmail.com');
INSERT INTO Collector1 (collectorID, email) VALUES (3, 'bob@email.com');
INSERT INTO Collector1 (collectorID, email) VALUES (4, 'dog@email.com');
INSERT INTO Collector1 (collectorID, email) VALUES (5, 'cat@email.com');

INSERT INTO Collector2 (email, collectorName) VALUES ('joe@yahoo.com', 'Joe');
INSERT INTO Collector2 (email, collectorName) VALUES ('jim@gmail.com', 'Jim');
INSERT INTO Collector2 (email, collectorName) VALUES ('bob@email.com', 'Bob');
INSERT INTO Collector2 (email, collectorName) VALUES ('dog@email.com', 'Dog');
INSERT INTO Collector2 (email, collectorName) VALUES ('cat@email.com', 'Cat');

INSERT INTO Collector3 (collectorID, collectorPassword) VALUES (1, 'pass123');
INSERT INTO Collector3 (collectorID, collectorPassword) VALUES (2, 'pass123'); 
INSERT INTO Collector3 (collectorID, collectorPassword) VALUES (3, 'pass123');
INSERT INTO Collector3 (collectorID, collectorPassword) VALUES (4, 'woof123');
INSERT INTO Collector3 (collectorID, collectorPassword) VALUES (5, 'meow123');


INSERT INTO Collection1 (collectionID, collectionName) VALUES (1, '2024 Canadian Quarters');
INSERT INTO Collection2 (collectionID, collectorID) VALUES (1, 1);
INSERT INTO Collection3 (collectorID, collectionName, dateCreated) VALUES (1, '2024 Canadian Quarters', TO_DATE('2024-01-01', 'YYYY-MM-DD'));

INSERT INTO Collection1 (collectionID, collectionName) VALUES (2, 'Rare Money');
INSERT INTO Collection2 (collectionID, collectorID) VALUES (2, 2);
INSERT INTO Collection3 (collectorID, collectionName, dateCreated) VALUES (2, 'Rare Money', TO_DATE('2024-05-01', 'YYYY-MM-DD'));

INSERT INTO Collection1 (collectionID, collectionName) VALUES (3, 'Best Sports Cards');
INSERT INTO Collection2 (collectionID, collectorID) VALUES (3, 2);
INSERT INTO Collection3 (collectorID, collectionName, dateCreated) VALUES (2, 'Best Sports Cards', TO_DATE('2024-09-05', 'YYYY-MM-DD'));

INSERT INTO Collection1 (collectionID, collectionName) VALUES (4, 'Holographic Trading Cards');
INSERT INTO Collection2 (collectionID, collectorID) VALUES (4, 3);
INSERT INTO Collection3 (collectorID, collectionName, dateCreated) VALUES (3, 'Holographic Trading Cards', TO_DATE('2023-08-13', 'YYYY-MM-DD'));

INSERT INTO Collection1 (collectionID, collectionName) VALUES (5, 'Empty Collection');
INSERT INTO Collection2 (collectionID, collectorID) VALUES (5, 4);
INSERT INTO Collection3 (collectorID, collectionName, dateCreated) VALUES (4, 'Empty Collection', TO_DATE('2015-02-20', 'YYYY-MM-DD'));


INSERT INTO Auction1(auctionID, auctionHouse) VALUES (1, 'Heritage Auctions');
INSERT INTO Auction1(auctionID, auctionHouse) VALUES (2, 'Phillips');
INSERT INTO Auction1(auctionID, auctionHouse) VALUES (3, 'Bonhams');
INSERT INTO Auction1(auctionID, auctionHouse) VALUES (4, 'Sothebys');
INSERT INTO Auction1(auctionID, auctionHouse) VALUES (5, 'RR Auction');

INSERT INTO Auction2(auctionHouse, auctionLocation) VALUES ('Heritage Auctions', 'Dallas, TX');
INSERT INTO Auction2(auctionHouse, auctionLocation) VALUES ('Phillips', 'New York, NY');
INSERT INTO Auction2(auctionHouse, auctionLocation) VALUES ('Bonhams', 'London, UK');
INSERT INTO Auction2(auctionHouse, auctionLocation) VALUES ('Sothebys', 'New York, NY');
INSERT INTO Auction2(auctionHouse, auctionLocation) VALUES ('RR Auction', 'Boston, MA');


INSERT INTO Participates(collectorID, auctionID, participationDate) VALUES (1, 1, TO_DATE('2020-01-20', 'YYYY-MM-DD'));
INSERT INTO Participates(collectorID, auctionID, participationDate) VALUES (1, 2, TO_DATE('2022-02-24', 'YYYY-MM-DD'));
INSERT INTO Participates(collectorID, auctionID, participationDate) VALUES (2, 2, TO_DATE('2024-05-13', 'YYYY-MM-DD'));
INSERT INTO Participates(collectorID, auctionID, participationDate) VALUES (2, 3, TO_DATE('2024-05-13', 'YYYY-MM-DD'));
INSERT INTO Participates(collectorID, auctionID, participationDate) VALUES (3, 4, TO_DATE('2021-01-02', 'YYYY-MM-DD'));


INSERT INTO Series(seriesName, releaseDate, editionNumber) VALUES ('2024 Canadian Quarters', TO_DATE('2024-01-01', 'YYYY-MM-DD'), 1);
INSERT INTO Series(seriesName, releaseDate, editionNumber) VALUES ('2000 American Coins', TO_DATE('2000-01-01', 'YYYY-MM-DD'), 1);
INSERT INTO Series(seriesName, releaseDate, editionNumber) VALUES ('20th Century Euros', TO_DATE('1997-01-01', 'YYYY-MM-DD'), 97);
INSERT INTO Series(seriesName, releaseDate, editionNumber) VALUES ('2020 Japanese Yen', TO_DATE('2020-01-01', 'YYYY-MM-DD'), 2);
INSERT INTO Series(seriesName, releaseDate, editionNumber) VALUES ('Topps Baseball', TO_DATE('2022-02-16', 'YYYY-MM-DD'), 1);
INSERT INTO Series(seriesName, releaseDate, editionNumber) VALUES ('Upper Deck Legends', TO_DATE('2020-10-01', 'YYYY-MM-DD'), 4);
INSERT INTO Series(seriesName, releaseDate, editionNumber) VALUES ('Panini Mosaic Basketball', TO_DATE('2022-08-22', 'YYYY-MM-DD'), 1);
INSERT INTO Series(seriesName, releaseDate, editionNumber) VALUES ('Panini Mosaic Football', TO_DATE('2024-11-27', 'YYYY-MM-DD'), 1);
INSERT INTO Series(seriesName, releaseDate, editionNumber) VALUES ('Crown Jewels of the United Kingdom', TO_DATE('1660-01-01', 'YYYY-MM-DD'), 1);


INSERT INTO Manufacturer(manufacturerName, country, yearEstablished) VALUES ('The Royal Canadian Mint', 'Canada', 1908);
INSERT INTO Manufacturer(manufacturerName, country, yearEstablished) VALUES ('United States Mint', 'USA', 1792);
INSERT INTO Manufacturer(manufacturerName, country, yearEstablished) VALUES ('Bundesdruckerei', 'Germany', 1879);
INSERT INTO Manufacturer(manufacturerName, country, yearEstablished) VALUES ('Japan Mint', 'Japan', 1871);
INSERT INTO Manufacturer(manufacturerName, country, yearEstablished) VALUES ('Fanatics Inc.', 'USA', 1995);
INSERT INTO Manufacturer(manufacturerName, country, yearEstablished) VALUES ('Upper Deck', 'USA', 1988);
INSERT INTO Manufacturer(manufacturerName, country, yearEstablished) VALUES ('Panini', 'Italy', 1961);
INSERT INTO Manufacturer(manufacturerName, country, yearEstablished) VALUES ('East India Company', 'UK', 1600);
INSERT INTO Manufacturer(manufacturerName, country, yearEstablished) VALUES ('East India Co. Ltd.', 'UK', 1602);


INSERT INTO History(prevCollectorID, prevCollectorName, acquireDate, sellDate, priceSold) 
VALUES (1, 'James Sportsman', TO_DATE('2022-02-02', 'YYYY-MM-DD'), TO_DATE('2024-04-04', 'YYYY-MM-DD'), 99.99);

INSERT INTO History(prevCollectorID, prevCollectorName, acquireDate, sellDate, priceSold) 
VALUES (2, 'Penny Pincher', TO_DATE('2024-11-15', 'YYYY-MM-DD'), NULL, NULL);

INSERT INTO History(prevCollectorID, prevCollectorName, acquireDate, sellDate, priceSold) 
VALUES (3, 'John Doe', TO_DATE('2024-04-03', 'YYYY-MM-DD'), TO_DATE('2024-04-08', 'YYYY-MM-DD'), 3.5);

INSERT INTO History(prevCollectorID, prevCollectorName, acquireDate, sellDate, priceSold) 
VALUES (4, 'Ray Allen', NULL, NULL, NULL);

INSERT INTO History(prevCollectorID, prevCollectorName, acquireDate, sellDate, priceSold) 
VALUES (5, 'Queen Victoria', TO_DATE('1850-08-05', 'YYYY-MM-DD'), NULL, NULL);

INSERT INTO History(prevCollectorID, prevCollectorName, acquireDate, sellDate, priceSold) 
VALUES (6, 'Jane Doe', NULL, NULL, NULL);


INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (1, 'S.Curry Basketball Card', NULL, 'Panini Mosaic Basketball', TO_DATE('2022-08-22', 'YYYY-MM-DD'), 'Panini', 'Italy');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (2, 'LeBron James Trading Card', NULL, 'Panini Mosaic Basketball', TO_DATE('2022-08-22', 'YYYY-MM-DD'), 'Panini', 'Italy');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (3, 'Lionel Messi Soccer Card', 4, 'Panini Mosaic Football', TO_DATE('2024-11-27', 'YYYY-MM-DD'), 'Panini', 'Italy');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (4, 'Tom Brady Football Card', 4, 'Panini Mosaic Football', TO_DATE('2024-11-27', 'YYYY-MM-DD'), 'Panini', 'Italy');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (5, 'Crosby Holographic Hockey Card', 1, 'Upper Deck Legends', TO_DATE('2020-10-01', 'YYYY-MM-DD'), 'Upper Deck', 'USA');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (6, 'Canadian Quarter', 2, '2024 Canadian Quarters', TO_DATE('2024-01-01', 'YYYY-MM-DD'), 'The Royal Canadian Mint', 'Canada');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (7, 'Canadian Quarter', NULL, '2024 Canadian Quarters', TO_DATE('2024-01-01', 'YYYY-MM-DD'), 'The Royal Canadian Mint', 'Canada');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (8, 'Freedom Toonie', 3, '2000 American Coins', TO_DATE('2000-01-01', 'YYYY-MM-DD'), 'United States Mint', 'USA');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (9, '1997 50 Euro Banknote', NULL, '20th Century Euros', TO_DATE('1997-01-01', 'YYYY-MM-DD'), 'Bundesdruckerei', 'Germany');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (10, '10K JPY', NULL, '2020 Japanese Yen', TO_DATE('2020-01-01', 'YYYY-MM-DD'), 'Japan Mint', 'Japan');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (11, NULL, NULL, 'Crown Jewels of the United Kingdom', TO_DATE('1660-01-01', 'YYYY-MM-DD'), 'East India Co. Ltd.', 'UK');

INSERT INTO Item(itemID, itemName, prevCollectorID, seriesName, releaseDate, manufacturerName, country)
VALUES (12, 'Koh-I-Noor', 5, 'Crown Jewels of the United Kingdom', TO_DATE('1660-01-01', 'YYYY-MM-DD'), 'East India Company', 'UK');


INSERT INTO TradingCard1(itemID, athlete) VALUES (1, 'Stephan Curry');
INSERT INTO TradingCard2(itemID, cardVariation) VALUES  (1, 'Signature');
INSERT INTO TradingCard3(athlete, sport) VALUES ('Stephan Curry', 'Basketball');

INSERT INTO TradingCard1(itemID, athlete) VALUES (2, 'LeBron James');
INSERT INTO TradingCard2(itemID, cardVariation) VALUES  (2, 'Holographic');
INSERT INTO TradingCard3(athlete, sport) VALUES ('LeBron James', 'Basketball');

INSERT INTO TradingCard1(itemID, athlete) VALUES (3, 'Lionel Messi');
INSERT INTO TradingCard2(itemID, cardVariation) VALUES  (3, 'Base');
INSERT INTO TradingCard3(athlete, sport) VALUES ('Lionel Messi', 'Soccer');

INSERT INTO TradingCard1(itemID, athlete) VALUES (4, 'Tom Brady');
INSERT INTO TradingCard2(itemID, cardVariation) VALUES  (4, 'Rookie');
INSERT INTO TradingCard3(athlete, sport) VALUES ('Tom Brady', 'Football');

INSERT INTO TradingCard1(itemID, athlete) VALUES (5, 'Sidney Crosby');
INSERT INTO TradingCard2(itemID, cardVariation) VALUES  (5, 'Holographic');
INSERT INTO TradingCard3(athlete, sport) VALUES ('Sidney Crosby', 'Hockey');


INSERT INTO Coin(itemID, currency, denomination) VALUES (6, 'CAD', 0.25);
INSERT INTO Coin(itemID, currency, denomination) VALUES (7, 'CAD', 0.25);
INSERT INTO Coin(itemID, currency, denomination) VALUES (8, 'USD', 2);
INSERT INTO Coin(itemID, currency, denomination) VALUES (9, 'EUR', 50);
INSERT INTO Coin(itemID, currency, denomination) VALUES (10, 'JPY', 10000);


INSERT INTO Appraiser(appraiserID, appraiserName) VALUES (1, 'Jesse Nash');
INSERT INTO Appraiser(appraiserID, appraiserName) VALUES (2, 'Katie Hanna');
INSERT INTO Appraiser(appraiserID, appraiserName) VALUES (3, 'Martin James');
INSERT INTO Appraiser(appraiserID, appraiserName) VALUES (4, 'Nicholas Hill');
INSERT INTO Appraiser(appraiserID, appraiserName) VALUES (5, 'Randy Eaton');


INSERT INTO Valuation(appraiserID, itemID, appraisalValue, condition) VALUES (1, 5, 100, 'Good');
INSERT INTO Valuation(appraiserID, itemID, appraisalValue, condition) VALUES (2, 6, 0.25, 'Very Good');
INSERT INTO Valuation(appraiserID, itemID, appraisalValue, condition) VALUES (3, 12, 150000000, 'Excellent');
INSERT INTO Valuation(appraiserID, itemID, appraisalValue, condition) VALUES (3, 3, 16, 'Fair');
INSERT INTO Valuation(appraiserID, itemID, appraisalValue, condition) VALUES (4, 1, 15.99, 'Good');
INSERT INTO Valuation(appraiserID, itemID, appraisalValue, condition) VALUES (5, 1, 20.49, 'Very Good');


INSERT INTO Includes(auctionID, itemID) VALUES (1, 1);
INSERT INTO Includes(auctionID, itemID) VALUES (1, 2);
INSERT INTO Includes(auctionID, itemID) VALUES (2, 1);
INSERT INTO Includes(auctionID, itemID) VALUES (3, 3);
INSERT INTO Includes(auctionID, itemID) VALUES (3, 6);
INSERT INTO Includes(auctionID, itemID) VALUES (3, 8);
INSERT INTO Includes(auctionID, itemID) VALUES (4, 10);
INSERT INTO Includes(auctionID, itemID) VALUES (4, 12);
INSERT INTO Includes(auctionID, itemID) VALUES (1, 6);
INSERT INTO Includes(auctionID, itemID) VALUES (1, 7);
INSERT INTO Includes(auctionID, itemID) VALUES (2, 6);
INSERT INTO Includes(auctionID, itemID) VALUES (2, 7);


INSERT INTO PartOf(itemID, collectionID) VALUES (1, 3);
INSERT INTO PartOf(itemID, collectionID) VALUES (2, 3);
INSERT INTO PartOf(itemID, collectionID) VALUES (3, 3);
INSERT INTO PartOf(itemID, collectionID) VALUES (4, 3);
INSERT INTO PartOf(itemID, collectionID) VALUES (5, 3);
INSERT INTO PartOf(itemID, collectionID) VALUES (6, 1);
INSERT INTO PartOf(itemID, collectionID) VALUES (7, 1);
INSERT INTO PartOf(itemID, collectionID) VALUES (9, 2);
INSERT INTO PartOf(itemID, collectionID) VALUES (10, 2);
INSERT INTO PartOf(itemID, collectionID) VALUES (2, 4);
INSERT INTO PartOf(itemID, collectionID) VALUES (5, 4);

-- COMMIT new tuples
COMMIT;
