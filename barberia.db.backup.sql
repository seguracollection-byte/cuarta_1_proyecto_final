-- MySQL dump 10.13  Distrib 8.0.46, for macos15 (arm64)
--
-- Host: localhost    Database: barberia_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.28-MariaDB

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
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invitado_nombre` varchar(255) DEFAULT NULL,
  `invitado_email` varchar(255) DEFAULT NULL,
  `fecha_hora` datetime NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada') DEFAULT 'pendiente',
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `invitado_telefono` varchar(255) DEFAULT NULL,
  `servicios_idservicios` int(11) NOT NULL,
  `barbero_id` int(11) NOT NULL,
  `usuarios_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_citas_servicios_idx` (`servicios_idservicios`),
  KEY `fk_citas_usuarios1_idx` (`barbero_id`),
  KEY `fk_citas_usuarios2_idx` (`usuarios_id`),
  CONSTRAINT `fk_citas_servicios` FOREIGN KEY (`servicios_idservicios`) REFERENCES `servicios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_citas_usuarios1` FOREIGN KEY (`barbero_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_citas_usuarios2` FOREIGN KEY (`usuarios_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,'Cita Test','citatest@email.com','2026-06-30 15:00:00','pendiente','2026-06-30 13:51:19','90785623',1,3,NULL),(2,'CitaTest ChemaBarber','citatestchemabarber@email.com','2026-06-30 18:00:00','pendiente','2026-06-30 22:31:59','90785634',1,5,NULL),(3,NULL,NULL,'2026-06-30 18:00:00','pendiente','2026-06-30 22:50:11',NULL,2,3,6),(4,NULL,NULL,'2026-06-30 18:00:00','pendiente','2026-06-30 22:50:36',NULL,3,2,4),(5,NULL,NULL,'2026-07-06 12:00:00','pendiente','2026-07-05 23:11:35',NULL,1,5,6),(6,'Josue Segura','josue.@email.com','2026-07-06 15:00:00','pendiente','2026-07-06 01:35:32','90378256',1,5,NULL);
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `duracion_minutos` int(11) DEFAULT 30,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios`
--

LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
INSERT INTO `servicios` VALUES (1,'Corte de Cabello','Corte moderno con lavado incluido',5000.00,30,1),(2,'Arreglo de Barba','Perfilado de barba con toalla caliente',3000.00,20,1),(3,'Combo VIP','Corte, barba y mascarilla negra',7500.00,50,1);
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(45) NOT NULL,
  `password` varchar(1000) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `rol` enum('cliente','barbero','administrador') DEFAULT 'cliente',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Carlos Administrador','admin@barberia.com','88881111','admin123','2026-06-29 02:50:22','administrador'),(2,'Chema Barbero 1','chema@barberia.com','88882222','barbero123','2026-06-29 02:50:22','barbero'),(3,'Alex Barbero 2','alex@barberia.com','88883333','barbero123','2026-06-29 02:50:22','barbero'),(4,'Guillermo Admin','guiler@admin.com','88887090','$2b$10$yGBl884Wswu4P1OfwPK.M.YIKJZ2BKBqYFoIxXbd1/0QjSwNUWTQO','2026-06-29 18:29:21','administrador'),(5,'Chema Barbero','chema@barbero.com','88709088','$2b$10$XMTOOPim0dSEeF3s/og7bueehyE7ePcbYI1IXbGKtBCbWeblQt/ma','2026-06-29 18:32:38','barbero'),(6,'Corinna Pierce','corinna@cliente.com','89078670','$2b$10$vv7ekFEzp31g7gCoqykYqO9JrVeEOr..Pigb71a7qDoi2EikZnwsC','2026-06-29 19:11:58','cliente'),(13,'Test Pierce','testadmin@pierce.com','90873456','$2b$10$Qt8tsXvBNj3f.vOmerrKxOUh/jb3/mTJJ7va5py3BSIyzVyv3haUS','2026-07-06 01:03:33','administrador');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-06 19:46:55
