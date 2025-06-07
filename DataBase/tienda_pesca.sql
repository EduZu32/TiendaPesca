-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-02-2025 a las 14:01:20
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tienda_pesca`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedidos`
--

CREATE TABLE `detalle_pedidos` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','enviado','completado','cancelado') DEFAULT 'pendiente',
  `fecha_pedido` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 10,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `categoria` varchar(50) NOT NULL DEFAULT 'General'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `imagen`, `stock`, `fecha_creacion`, `categoria`) VALUES
(1, 'Caña Shimano', 'Nueva versión de la caña Shimano con mejor resistencia.', 149.99, 'utils/img/cana_shimano_xt1.jpg', 20, '2025-02-07 12:29:59', 'Cañas de Pesca'),
(2, 'Caña Shimano XT', 'Caña de pesca ultraligera con tecnología avanzada.', 129.99, 'utils/img/cana_shimano_xt2.jpg', 15, '2025-02-07 12:58:28', 'Cañas de Pesca'),
(3, 'Carrete Daiwa BG 3000', 'Carrete de pesca resistente al agua salada, ideal para spinning.', 89.99, 'utils/img/carrete_daiwa_bg.jpg', 10, '2025-02-07 12:58:39', 'Carretes'),
(4, 'Señuelo Rapala X-Rap', 'Señuelo artificial flotante con acción realista.', 14.99, 'utils/img/senuelo_rapala_xrap.jpg', 50, '2025-02-07 12:58:49', 'Señuelos'),
(5, 'Anzuelo Mustad 2X Strong', 'Anzuelos de alta resistencia para peces grandes.', 5.99, 'utils/img/anzuelo_mustad.jpg', 100, '2025-02-07 12:59:00', 'Anzuelos'),
(6, 'Sedal PowerPro 20lb', 'Hilo de pesca trenzado con resistencia extrema.', 24.99, 'utils/img/sedal_powerpro.jpg', 30, '2025-02-07 12:59:09', 'Hilos'),
(7, 'Caja de aparejos Plano 3700', 'Caja organizadora de señuelos y accesorios de pesca.', 34.99, 'utils/img/caja_aparejos_plano.jpg', 20, '2025-02-07 12:59:17', 'Aparejos'),
(8, 'Caña Daiwa Megaforce', 'Caña de pesca telescópica ideal para agua dulce.', 74.99, 'utils/img/cana_daiwa_megaforce.jpg', 20, '2025-02-07 13:05:11', 'Cañas de Pesca'),
(9, 'Carrete Shimano Stradic CI4+', 'Carrete de spinning ultraligero con cuerpo de carbono.', 199.99, 'utils/img/carrete_shimano_stradic.jpg', 8, '2025-02-07 13:05:22', 'Carretes'),
(10, 'Señuelo Yo-Zuri 3D Minnow', 'Señuelo flotante con diseño 3D realista.', 17.99, 'utils/img/senuelo_yozuri_3d.jpg', 30, '2025-02-07 13:05:30', 'Señuelos'),
(11, 'Anzuelo Gamakatsu Octopus', 'Anzuelos curvos de alta penetración, tamaño 4/0.', 6.99, 'utils/img/anzuelo_gamakatsu_octopus.jpg', 120, '2025-02-07 13:05:39', 'Anzuelos'),
(12, 'Sedal Berkley Trilene XL', 'Sedal de monofilamento con baja memoria.', 9.99, 'utils/img/sedal_berkley_trilene.jpg', 40, '2025-02-07 13:05:46', 'Hilos'),
(13, 'Caja de aparejos Flambeau 5000', 'Caja con múltiples compartimentos y bandejas desplegables.', 39.99, 'utils/img/caja_aparejos_flambeau.jpg', 15, '2025-02-07 13:05:53', 'Aparejos'),
(14, 'Plomadas de Pesca 50g', 'Paquete de 10 plomadas para fondo y curricán.', 4.99, 'utils/img/plomadas_pesca.jpg', 200, '2025-02-07 13:06:00', 'Plomadas'),
(15, 'Red de Pesca Plegable', 'Red de mano con mango telescópico de aluminio.', 29.99, 'utils/img/red_pesca_plegable.jpg', 10, '2025-02-07 13:06:07', 'Red'),
(16, 'Chaleco Salvavidas Mustang', 'Chaleco flotante homologado para pesca en kayak.', 89.99, 'utils/img/chaleco_mustang.jpg', 5, '2025-02-07 13:06:14', 'Accesorios'),
(17, 'Lámpara LED para Pesca Nocturna', 'Lámpara sumergible con luz verde para atraer peces.', 19.99, 'utils/img/lampara_pesca_nocturna.jpg', 25, '2025-02-07 13:06:20', 'Accesorios');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tipo` enum('admin','cliente') DEFAULT 'cliente',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `tipo`, `fecha_registro`) VALUES
(2, 'EduZu', 'edu@example.com', '$2a$10$tAwjlW0738m7txYVOx796uBH0QJ6cX7semaGlc8FJjAwlhBVR.a6.', 'cliente', '2025-02-06 18:29:51'),
(3, 'Edy', 'edy@example.com', '$2a$10$qGc7f7ihiu.NJuhIcopzfeKhjLmb.1Urm8KoQFXgUrt9ubanBUREi', 'cliente', '2025-02-06 20:06:39'),
(4, 'Admin', 'admin@example.com', '$2a$10$Y7H482wXFmB.9ut90syq2ODDNywRSMxuI2oxKjjH9GUqt.Nt4jPga', 'admin', '2025-02-07 12:01:22');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  ADD CONSTRAINT `detalle_pedidos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `detalle_pedidos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
