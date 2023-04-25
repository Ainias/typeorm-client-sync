UNLOCK TABLES;

USE typeormSync;
-- MariaDB dump 10.19  Distrib 10.11.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: typeormSync
-- ------------------------------------------------------
-- Server version	10.11.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `author`
--

DROP TABLE IF EXISTS `author`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `author` (
                          `createdAt` datetime NOT NULL,
                          `updatedAt` datetime NOT NULL,
                          `deletedAt` datetime(6) DEFAULT NULL,
                          `name` varchar(255) NOT NULL,
                          `id` int(11) NOT NULL AUTO_INCREMENT,
                          `version` int(11) NOT NULL,
                          PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `author`
--

LOCK TABLES `author` WRITE;
/*!40000 ALTER TABLE `author` DISABLE KEYS */;
INSERT INTO `author` VALUES
                         ('2022-05-28 12:00:00','2022-05-28 12:00:00',NULL,'Author 1',1,0),
                         ('2022-05-28 12:00:00','2022-05-28 12:00:00',NULL,'Author 2',2,0),
                         ('2022-05-28 12:00:00','2022-05-28 12:00:00',NULL,'Author 3',3,0);
/*!40000 ALTER TABLE `author` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `book`
--

DROP TABLE IF EXISTS `book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `book` (
                        `id` int(11) NOT NULL AUTO_INCREMENT,
                        `createdAt` datetime NOT NULL,
                        `updatedAt` datetime NOT NULL,
                        `deletedAt` datetime(6) DEFAULT NULL,
                        `version` int(11) NOT NULL,
                        `name` varchar(255) NOT NULL,
                        PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book`
--

LOCK TABLES `book` WRITE;
/*!40000 ALTER TABLE `book` DISABLE KEYS */;
INSERT INTO `book` VALUES
    (1,'2023-04-22 16:27:23','2023-04-22 16:27:34',NULL,1,'Book 1');
/*!40000 ALTER TABLE `book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `book_authors_author`
--

DROP TABLE IF EXISTS `book_authors_author`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `book_authors_author` (
                                       `bookId` int(11) NOT NULL,
                                       `authorId` int(11) NOT NULL,
                                       PRIMARY KEY (`bookId`,`authorId`),
                                       KEY `IDX_9bf58ffb2a12a8609a738ee8ca` (`bookId`),
                                       KEY `IDX_a4cafdf2ec9974524a5321c751` (`authorId`),
                                       CONSTRAINT `FK_9bf58ffb2a12a8609a738ee8cae` FOREIGN KEY (`bookId`) REFERENCES `book` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                       CONSTRAINT `FK_a4cafdf2ec9974524a5321c7516` FOREIGN KEY (`authorId`) REFERENCES `author` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book_authors_author`
--

LOCK TABLES `book_authors_author` WRITE;
/*!40000 ALTER TABLE `book_authors_author` DISABLE KEYS */;
INSERT INTO `book_authors_author` VALUES
    (1,1);
/*!40000 ALTER TABLE `book_authors_author` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comment` (
                           `createdAt` datetime NOT NULL,
                           `updatedAt` datetime NOT NULL,
                           `deletedAt` datetime(6) DEFAULT NULL,
                           `comment` varchar(255) NOT NULL,
                           `id` int(11) NOT NULL AUTO_INCREMENT,
                           `postId` int(11) DEFAULT NULL,
                           `authorId` int(11) DEFAULT NULL,
                           `version` int(11) NOT NULL,
                           PRIMARY KEY (`id`),
                           KEY `FK_94a85bb16d24033a2afdd5df060` (`postId`),
                           KEY `FK_276779da446413a0d79598d4fbd` (`authorId`),
                           CONSTRAINT `FK_276779da446413a0d79598d4fbd` FOREIGN KEY (`authorId`) REFERENCES `author` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                           CONSTRAINT `FK_94a85bb16d24033a2afdd5df060` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES
                          ('2022-05-31 12:00:00','2022-05-31 12:00:00',NULL,'My Comment 1',1,2,1,0),
                          ('2022-05-31 12:00:00','2022-05-31 12:00:00',NULL,'My Comment 2',2,2,2,0),
                          ('2022-05-31 12:00:00','2022-05-31 12:00:00',NULL,'My Comment 3',3,2,3,0),
                          ('2022-05-31 12:00:00','2022-05-31 12:00:00',NULL,'My Comment 4',4,2,1,0),
                          ('2022-05-31 12:00:00','2022-05-31 12:00:00',NULL,'My Comment 5',5,2,2,0);
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post` (
                        `createdAt` datetime NOT NULL,
                        `updatedAt` datetime NOT NULL,
                        `deletedAt` datetime(6) DEFAULT NULL,
                        `text` varchar(255) NOT NULL,
                        `id` int(11) NOT NULL AUTO_INCREMENT,
                        `authorId` int(11) DEFAULT NULL,
                        `version` int(11) NOT NULL,
                        PRIMARY KEY (`id`),
                        KEY `FK_c6fb082a3114f35d0cc27c518e0` (`authorId`),
                        CONSTRAINT `FK_c6fb082a3114f35d0cc27c518e0` FOREIGN KEY (`authorId`) REFERENCES `author` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES
                       ('2022-05-29 12:10:00','2022-05-29 12:10:00',NULL,'Post Sync Test 1',1,1,0),
                       ('2022-04-29 12:10:00','2022-04-29 12:10:00',NULL,'Post Sync Test 2',2,1,0),
                       ('2022-03-29 12:10:00','2022-03-29 12:10:00',NULL,'Post Sync Test 3',3,2,0),
                       ('2022-02-28 12:10:00','2022-02-28 12:10:00',NULL,'Post Sync Test 4',4,2,0),
                       ('2022-01-29 12:10:00','2022-01-29 12:10:00',NULL,'Post Sync Test 5',5,3,0),
                       ('2022-01-29 12:10:00','2022-05-29 12:10:00','2022-05-29 12:10:00.000000','Post Sync Test 5',6,3,0);
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-04-22 16:28:49
