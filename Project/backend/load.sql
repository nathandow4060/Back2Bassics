SET GLOBAL local_infile = 1;

-- Load Users
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Users.csv'
INTO TABLE Users
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Record_Label
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Record_Label.csv'
INTO TABLE Record_Label
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Artist
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Artist.csv'
INTO TABLE Artist
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Listener
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Listener.csv'
INTO TABLE Listener
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Follows
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Follows.csv'
INTO TABLE Follows
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Listens_To
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Listens_To.csv'
INTO TABLE Listens_To
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Playlist
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Playlist.csv'
INTO TABLE Playlist
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Album
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Album.csv'
INTO TABLE Album
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Track
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Track.csv'
INTO TABLE Track
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Added_To
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Added_To.csv'
INTO TABLE Added_To
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Writes
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Writes.csv'
INTO TABLE Writes
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Interaction
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Interaction.csv'
INTO TABLE Interaction
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Review
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Review.csv'
INTO TABLE Review
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Likes
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Likes.csv'
INTO TABLE Likes
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Load Rating
LOAD DATA INFILE '../Back2Bassics/dev/backend/partC/spotifyAPI/Rating.csv'
INTO TABLE Rating
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
