package sgatc;

public class TransaccionService {
    private AlmacenService almacenService;
    private ProductoService productoService;

    public TransaccionService(AlmacenService almacenService, ProductoService productoService) {
        this.almacenService = almacenService;
        this.productoService = productoService;
    }

    public void agregarProducto(Almacen almacen, String codigoProducto, int cantidad) {
        Producto producto = productoService.buscarProducto(codigoProducto);
        if (producto == null) {
            throw new IllegalArgumentException("Producto no encontrado");
        }
        
        if (!almacenService.hayEspacioDisponible(almacen, cantidad)) {
            throw new IllegalArgumentException("No hay espacio suficiente en el almacen");
        }
        
        almacen.agregarProducto(codigoProducto, cantidad);
        System.out.printf(" %d unidades de %s agregadas a %s\n", 
                         cantidad, producto.getNombre(), almacen.getIdAlmacen());
    }

    public void retirarProducto(Almacen almacen, String codigoProducto, int cantidad) {
        Integer existente = almacen.getProductos().get(codigoProducto);
        if (existente == null || existente < cantidad) {
            Producto p = productoService.buscarProducto(codigoProducto);
            String nombre = p != null ? p.getNombre() : codigoProducto;
            throw new IllegalArgumentException("No hay suficiente stock de " + nombre);
        }
        
        almacen.retirarProducto(codigoProducto, cantidad);
        System.out.printf(" %d unidades retiradas de %s\n", cantidad, almacen.getIdAlmacen());
    }

    public void mostrarInventario(Almacen almacen) {
        System.out.println("\n Inventario de " + almacen);
        if (almacen.getProductos().isEmpty()) {
            System.out.println("No hay productos en este almacen");
            return;
        }
        
        almacen.getProductos().forEach((codigo, cantidad) -> {
            Producto p = productoService.buscarProducto(codigo);
            String infoProducto = p != null ? p.toString() : codigo;
            System.out.printf("  - %s: %d unidades\n", infoProducto, cantidad);
        });
    }
}