-- Create UserFollowerStats View
CREATE VIEW UserFollowerStats AS
SELECT u.Tag, 
       COALESCE(followers.Number_Followers, 0) AS Number_Followers,
       COALESCE(following.Num_Following, 0) AS Num_Following
FROM Users u
LEFT JOIN (SELECT Followed_Tag, COUNT(Follower_Tag) AS Number_Followers FROM Follows GROUP BY Followed_Tag) AS followers
    ON u.Tag = followers.Followed_Tag
LEFT JOIN (SELECT Follower_Tag, COUNT(Followed_Tag) AS Num_Following FROM Follows GROUP BY Follower_Tag) AS following
    ON u.Tag = following.Follower_Tag;
