package sgatc;

import java.util.Scanner;

public class Main {
    private static Scanner scanner = new Scanner(System.in);
    private static ProductoService productoService = new ProductoService();
    private static AlmacenService almacenService = new AlmacenService();
    private static TransaccionService transaccionService = 
        new TransaccionService(almacenService, productoService);

    public static void main(String[] args) {
        inicializarDatos();
        mostrarMenuPrincipal();
    }

    private static void inicializarDatos() {
        productoService.inicializarDatos();
        almacenService.inicializarDatos();
    }

    private static void mostrarMenuPrincipal() {
        while (true) {
            System.out.println("\n=== SISTEMA DE GESTION DE ALMACENES ===");
            System.out.println("1. Seleccionar almacen");
            System.out.println("2. Listar todos los productos");
            System.out.println("3. Salir");
            System.out.print(" Seleccione una opción: ");
            
            int opcion = leerEntero();
            
            switch (opcion) {
                case 1:
                    seleccionarAlmacen();
                    break;
                case 2:
                    listarProductos();
                    break;
                case 3:
                    System.out.println(" ¡Hasta pronto!");
                    return;
                default:
                    System.out.println(" Opción inválida");
            }
        }
    }

    private static void seleccionarAlmacen() {
        System.out.println("\n ALMACENES DISPONIBLES:");
        almacenService.listarAlmacenes().forEach(System.out::println);
        
        System.out.print("\nIngrese ID del almacén (o 0 para volver): ");
        String idAlmacen = scanner.nextLine();
        
        if (idAlmacen.equals("0")) return;
        
        Almacen almacen = almacenService.buscarAlmacen(idAlmacen);
        if (almacen == null) {
            System.out.println(" Almacén no encontrado");
            return;
        }
        
        mostrarMenuAlmacen(almacen);
    }

    private static void mostrarMenuAlmacen(Almacen almacen) {
        while (true) {
            System.out.println("\n===  " + almacen.getIdAlmacen() + " ===");
            System.out.println("1. Agregar productos");
            System.out.println("2. Retirar productos");
            System.out.println("3. Ver inventario");
            System.out.println("4. Volver al menú principal");
            System.out.print("Seleccione una opción: ");
            
            int opcion = leerEntero();
            
            switch (opcion) {
                case 1:
                    agregarProductos(almacen);
                    break;
                case 2:
                    retirarProductos(almacen);
                    break;
                case 3:
                    transaccionService.mostrarInventario(almacen);
                    break;
                case 4:
                    return;
                default:
                    System.out.println(" Opción inválida");
            }
        }
    }

    private static void agregarProductos(Almacen almacen) {
        transaccionService.mostrarInventario(almacen);
        System.out.println("\n PRODUCTOS DISPONIBLES:");
        productoService.listarProductos().forEach(System.out::println);
        
        System.out.print("\nIngrese código del producto: ");
        String codigo = scanner.nextLine();
        
        System.out.print("Ingrese cantidad a agregar: ");
        int cantidad = leerEntero();
        
        try {
            transaccionService.agregarProducto(almacen, codigo, cantidad);
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    private static void retirarProductos(Almacen almacen) {
        transaccionService.mostrarInventario(almacen);
        
        System.out.print("\nIngrese código del producto: ");
        String codigo = scanner.nextLine();
        
        System.out.print("Ingrese cantidad a retirar: ");
        int cantidad = leerEntero();
        
        try {
            transaccionService.retirarProducto(almacen, codigo, cantidad);
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    private static void listarProductos() {
        System.out.println("\n TODOS LOS PRODUCTOS:");
        productoService.listarProductos().forEach(p -> 
            System.out.println(p + " - " + p.getCategoria()));
    }

    private static int leerEntero() {
        while (true) {
            try {
                return Integer.parseInt(scanner.nextLine());
            } catch (NumberFormatException e) {
                System.out.print("Ingrese un número válido: ");
            }
        }
    }
}