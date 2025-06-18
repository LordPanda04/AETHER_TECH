create database SistemaGestorAlmacen;
use SistemaGestorAlmacen;

create table usuarios (
	usuario varchar(20) PRIMARY KEY,
	contraseña VARCHAR(20)
);

insert into usuarios values
	('admin','metro123'),
   	('usuario1','clave123'),
   	('ola','123');


create table categoria (
	id_categ int PRIMARY KEY,
    nombre_categ varchar(20),
    descrip_categ varchar(40)
);

create table productos (
	id_prod varchar(20) PRIMARY KEY,
	nombre varchar(20),
    marca varchar(20),
    descrip varchar(40),
    id_categ int,
    unid_medida varchar(20),
    stock_prod int,
    precio_prod decimal(10,2),
    activo tinyint(1),
    FOREIGN KEY (id_categ) references categoria(id_categ)
);

create table lote (
	id_lote int PRIMARY KEY,
    cantidad_lote int,
    fecha_caducidad date,
    id_prod varchar(20),
    FOREIGN KEY (id_prod) references productos(id_prod)
);
