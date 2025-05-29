package sgatc;

import java.util.Date;
import java.util.ArrayList;
import java.util.List;

public class ProductoService {
    private List<Producto> productos;

    public ProductoService() {
        this.productos = new ArrayList<>();
    }

    public void agregarProducto(Producto producto) {
        productos.add(producto);
    }

    public Producto buscarProducto(String codigo) {
        return productos.stream()
                .filter(p -> p.getCodigo().equals(codigo))
                .findFirst()
                .orElse(null);
    }

    public List<Producto> listarProductos() {
        return new ArrayList<>(productos);
    }

    public void inicializarDatos() {
        // Datos de ejemplo
        agregarProducto(new Producto("P-001", "Leche", "Lacteos", 2.5, new Date(), "LOTE1"));
        agregarProducto(new Producto("P-002", "Pan", "Panaderia", 1.0, new Date(), "LOTE2"));
        agregarProducto(new Producto("P-003", "Arroz", "Granos", 1.8, new Date(), "LOTE3"));
    }
}