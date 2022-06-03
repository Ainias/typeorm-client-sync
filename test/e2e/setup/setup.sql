UNLOCK TABLES;

USE typeormSync;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT = @@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS = @@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION = @@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE = @@TIME_ZONE */;
/*!40103 SET TIME_ZONE = '+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0 */;
/*!40101 SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES = @@SQL_NOTES, SQL_NOTES = 0 */;

DROP TABLE author;
CREATE TABLE `author`
(
    `createdAt` datetime                                NOT NULL,
    `updatedAt` datetime                                NOT NULL,
    `deletedAt` datetime(6) DEFAULT NULL,
    `name`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `id`        int(11)                                 NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

INSERT INTO typeormSync.author (createdAt, updatedAt, deletedAt, name, id)
VALUES ('2022-05-28 12:00:00.000', '2022-05-28 12:00:00.000', NULL, 'Author 1', 1),
       ('2022-05-28 12:00:00.000', '2022-05-28 12:00:00.000', NULL, 'Author 2', 2),
       ('2022-05-28 12:00:00.000', '2022-05-28 12:00:00.000', NULL, 'Author 3', 3);


DROP TABLE post;
CREATE TABLE `post`
(
    `createdAt` datetime                                NOT NULL,
    `updatedAt` datetime                                NOT NULL,
    `deletedAt` datetime(6) DEFAULT NULL,
    `text`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `id`        int(11)                                 NOT NULL AUTO_INCREMENT,
    `authorId`  int(11)     DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_c6fb082a3114f35d0cc27c518e0` (`authorId`),
    CONSTRAINT `FK_c6fb082a3114f35d0cc27c518e0` FOREIGN KEY (`authorId`) REFERENCES `author` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB
  AUTO_INCREMENT = 7
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

INSERT INTO typeormSync.post (createdAt, updatedAt, deletedAt, `text`, id, authorId)
VALUES ('2022-05-29 12:10:00.000', '2022-05-29 12:10:00.000', NULL, 'Post Sync Test 1', 1, 1),
       ('2022-04-29 12:10:00.000', '2022-04-29 12:10:00.000', NULL, 'Post Sync Test 2', 2, 1),
       ('2022-03-29 12:10:00.000', '2022-03-29 12:10:00.000', NULL, 'Post Sync Test 3', 3, 2),
       ('2022-02-28 12:10:00.000', '2022-02-28 12:10:00.000', NULL, 'Post Sync Test 4', 4, 2),
       ('2022-01-29 12:10:00.000', '2022-01-29 12:10:00.000', NULL, 'Post Sync Test 5', 5, 3),
       ('2022-01-29 12:10:00.000', '2022-05-29 12:10:00.000', '2022-05-29 12:10:00.000', 'Post Sync Test 5', 6, 3);

DROP TABLE `comment`;
CREATE TABLE `comment`
(
    `createdAt` datetime                                NOT NULL,
    `updatedAt` datetime                                NOT NULL,
    `deletedAt` datetime(6) DEFAULT NULL,
    `comment`   varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `id`        int(11)                                 NOT NULL AUTO_INCREMENT,
    `postId`    int(11)     DEFAULT NULL,
    `authorId`  int(11)     DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_94a85bb16d24033a2afdd5df060` (`postId`),
    KEY `FK_276779da446413a0d79598d4fbd` (`authorId`),
    CONSTRAINT `FK_276779da446413a0d79598d4fbd` FOREIGN KEY (`authorId`) REFERENCES `author` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `FK_94a85bb16d24033a2afdd5df060` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB
  AUTO_INCREMENT = 6
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

INSERT INTO typeormSync.comment (createdAt, updatedAt, deletedAt, comment, id, postId, authorId)
VALUES ('2022-05-31 12:00:00.000', '2022-05-31 12:00:00.000', NULL, 'My Comment 1', 1, 2, 1),
       ('2022-05-31 12:00:00.000', '2022-05-31 12:00:00.000', NULL, 'My Comment 2', 2, 2, 2),
       ('2022-05-31 12:00:00.000', '2022-05-31 12:00:00.000', NULL, 'My Comment 3', 3, 2, 3),
       ('2022-05-31 12:00:00.000', '2022-05-31 12:00:00.000', NULL, 'My Comment 4', 4, 2, 1),
       ('2022-05-31 12:00:00.000', '2022-05-31 12:00:00.000', NULL, 'My Comment 5', 5, 2, 2);


/*!40103 SET TIME_ZONE = @OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE = @OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT = @OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS = @OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION = @OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES = @OLD_SQL_NOTES */;
