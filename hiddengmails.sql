CREATE DATABASE  IF NOT EXISTS `hiddengmails` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `hiddengmails`;
-- MySQL dump 10.13  Distrib 8.0.25, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hiddengmails
-- ------------------------------------------------------
-- Server version	8.0.25

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `awaiting_payments`
--

DROP TABLE IF EXISTS `awaiting_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `awaiting_payments` (
  `awaitingid` int NOT NULL AUTO_INCREMENT,
  `maintableid` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `recovery` varchar(255) NOT NULL,
  `proxy` varchar(255) NOT NULL,
  `proxyexpiry` varchar(255) NOT NULL,
  `dateadded` datetime NOT NULL,
  `orderno` int NOT NULL,
  PRIMARY KEY (`awaitingid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `awaiting_payments`
--

LOCK TABLES `awaiting_payments` WRITE;
/*!40000 ALTER TABLE `awaiting_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `awaiting_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discordusers`
--

DROP TABLE IF EXISTS `discordusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discordusers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discordid` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discordusers`
--

LOCK TABLES `discordusers` WRITE;
/*!40000 ALTER TABLE `discordusers` DISABLE KEYS */;
INSERT INTO `discordusers` VALUES (3,'939128543793782835','deh#5120'),(4,'748143796814086265','cls#6666'),(5,'255719666088017920','gNSSOMA#9974'),(6,'313243968613646336','Dawn ツ#1226'),(7,'936329238993326090','ManualLoop#3866'),(8,'475109099705729024','Yom#9668'),(9,'803311048492711967','geronimo#1624');
/*!40000 ALTER TABLE `discordusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gmails`
--

DROP TABLE IF EXISTS `gmails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gmails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `recovery` varchar(255) NOT NULL,
  `proxy` varchar(255) NOT NULL,
  `proxyexpiry` varchar(45) NOT NULL,
  `dateadded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gmails`
--

LOCK TABLES `gmails` WRITE;
/*!40000 ALTER TABLE `gmails` DISABLE KEYS */;
/*!40000 ALTER TABLE `gmails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `idorders` int NOT NULL AUTO_INCREMENT,
  `customer` varchar(255) NOT NULL,
  `discord` varchar(45) NOT NULL,
  `quantity` int NOT NULL,
  `paymentintent` varchar(45) NOT NULL,
  `dateadded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idorders`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `soldgmails`
--

DROP TABLE IF EXISTS `soldgmails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `soldgmails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `recovery` varchar(255) NOT NULL,
  `proxy` varchar(255) NOT NULL,
  `proxyexpiry` varchar(45) NOT NULL,
  `dateadded` datetime NOT NULL,
  `datesold` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `customer` varchar(255) NOT NULL,
  `discord` varchar(45) NOT NULL,
  `orderno` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_idx` (`orderno`),
  CONSTRAINT `fk_orderno` FOREIGN KEY (`orderno`) REFERENCES `orders` (`idorders`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `soldgmails`
--

LOCK TABLES `soldgmails` WRITE;
/*!40000 ALTER TABLE `soldgmails` DISABLE KEYS */;
/*!40000 ALTER TABLE `soldgmails` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-07-08 19:48:26
