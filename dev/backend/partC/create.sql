-- Create Users Table
CREATE TABLE Users (
    Tag VARCHAR(50) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL
);

-- Create Record_Label Table
CREATE TABLE Record_Label (
    Label_ID INT PRIMARY KEY,
    Label_Name VARCHAR(50) NOT NULL
);

-- Create Artist Table
CREATE TABLE Artist (
    Tag VARCHAR(50) PRIMARY KEY,
    Label_ID INT,
    Stage_Name VARCHAR(100) NOT NULL,
    Monthly_Listeners INT NOT NULL DEFAULT 0,
    Avg_Ranking FLOAT,
    FOREIGN KEY (Tag) REFERENCES Users(Tag) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Label_ID) REFERENCES Record_Label(Label_ID) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create Listener Table
CREATE TABLE Listener (
    Tag VARCHAR(50) PRIMARY KEY,
    Top_Artist VARCHAR(50),
    FOREIGN KEY (Tag) REFERENCES Users(Tag) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Top_Artist) REFERENCES Artist(Tag) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create Follows Table
CREATE TABLE Follows (
    Follower_Tag VARCHAR(50),
    Followed_Tag VARCHAR(50),
    PRIMARY KEY (Follower_Tag, Followed_Tag),
    FOREIGN KEY (Follower_Tag) REFERENCES Users(Tag) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Followed_Tag) REFERENCES Users(Tag) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Listens_To Table
CREATE TABLE Listens_To (
    Listener_Tag VARCHAR(50),
    Artist_Tag VARCHAR(50),
    PRIMARY KEY (Listener_Tag, Artist_Tag),
    FOREIGN KEY (Listener_Tag) REFERENCES Listener(Tag) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Artist_Tag) REFERENCES Artist(Tag) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Playlist Table
CREATE TABLE Playlist (
    Playlist_ID INT PRIMARY KEY,
    Tag VARCHAR(50),
    Playlist_Name VARCHAR(100) NOT NULL,
    Num_Tracks INT DEFAULT 0,
    FOREIGN KEY (Tag) REFERENCES Users(Tag) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Track Table
CREATE TABLE Track (
    Track_ID INT PRIMARY KEY,
    Album_ID INT,
    Title VARCHAR(255) NOT NULL,
    Date_Released DATE NOT NULL,
    Genre VARCHAR(50),
    Length TIME NOT NULL,
    Like_Count INT DEFAULT 0,
    Avg_Rating FLOAT,
    FOREIGN KEY (Album_ID) REFERENCES Album(Album_ID) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create Added_To Table
CREATE TABLE Added_To (
    Playlist_ID INT,
    Track_ID INT,
    PRIMARY KEY (Playlist_ID, Track_ID),
    FOREIGN KEY (Playlist_ID) REFERENCES Playlist(Playlist_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Track_ID) REFERENCES Track(Track_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Writes Table
CREATE TABLE Writes (
    Artist_Tag VARCHAR(50),
    Track_ID INT,
    PRIMARY KEY (Artist_Tag, Track_ID),
    FOREIGN KEY (Artist_Tag) REFERENCES Artist(Tag) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Track_ID) REFERENCES Track(Track_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Album Table
CREATE TABLE Album (
    Album_ID INT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Date_Released DATE NOT NULL,
    Like_Count INT DEFAULT 0,
    Avg_Rating FLOAT,
    Num_Tracks INT DEFAULT 0
);

-- Create Interaction Table
CREATE TABLE Interaction (
    Interaction_ID INT PRIMARY KEY,
    Tag VARCHAR(50),
    Track_ID INT,
    Album_ID INT,
    FOREIGN KEY (Tag) REFERENCES Users(Tag) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Track_ID) REFERENCES Track(Track_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Album_ID) REFERENCES Album(Album_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Review Table
CREATE TABLE Review (
    Interaction_ID INT PRIMARY KEY,
    Review_Txt TEXT NOT NULL,
    FOREIGN KEY (Interaction_ID) REFERENCES Interaction(Interaction_ID) ON DELETE CASCADE
);

-- Create Like Table
CREATE TABLE Likes (
    Interaction_ID INT PRIMARY KEY,
    Liked BOOLEAN NOT NULL,
    FOREIGN KEY (Interaction_ID) REFERENCES Interaction(Interaction_ID) ON DELETE CASCADE
);

-- Create Rating Table
CREATE TABLE Rating (
    Interaction_ID INT PRIMARY KEY,
    Rating_Value FLOAT NOT NULL CHECK (Rating_Value BETWEEN 0.0 AND 10.0),
    FOREIGN KEY (Interaction_ID) REFERENCES Interaction(Interaction_ID) ON DELETE CASCADE
);

-- Create Chart Table
CREATE TABLE Chart (
    Chart_ID INT PRIMARY KEY,
    Category VARCHAR(50) NOT NULL,
    Avg_Ranking FLOAT
);

-- Create Track_Rank Table
CREATE TABLE Track_Rank (
    Track_ID INT,
    Chart_ID INT,
    Rank INT NOT NULL,
    PRIMARY KEY (Track_ID, Chart_ID),
    FOREIGN KEY (Track_ID) REFERENCES Track(Track_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Chart_ID) REFERENCES Chart(Chart_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Album_Rank Table
CREATE TABLE Album_Rank (
    Album_ID INT,
    Chart_ID INT,
    Rank INT NOT NULL,
    PRIMARY KEY (Album_ID, Chart_ID),
    FOREIGN KEY (Album_ID) REFERENCES Album(Album_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Chart_ID) REFERENCES Chart(Chart_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

