package sgatc;

import java.util.HashMap;
import java.util.Map;

public class Almacen {
    private String idAlmacen;
    private int capacidadMax;
    private Map<String, Integer> productos; // codigoProducto -> cantidad
    private String tipo;

    public Almacen(String idAlmacen, int capacidadMax, String tipo) {
        this.idAlmacen = idAlmacen;
        this.capacidadMax = capacidadMax;
        this.tipo = tipo;
        this.productos = new HashMap<>();
    }

    // Getters
    public String getIdAlmacen() { return idAlmacen; }
    public int getCapacidadMax() { return capacidadMax; }
    public String getTipo() { return tipo; }
    public Map<String, Integer> getProductos() { return productos; }

    public int getCapacidadAct() {
        return productos.values().stream().mapToInt(Integer::intValue).sum();
    }

    public void agregarProducto(String codigoProducto, int cantidad) {
        productos.merge(codigoProducto, cantidad, Integer::sum);
    }

    public void retirarProducto(String codigoProducto, int cantidad) {
        productos.computeIfPresent(codigoProducto, (k, v) -> v - cantidad);
    }

    @Override
    public String toString() {
        return String.format("%s (%s) - %d/%d", idAlmacen, tipo, getCapacidadAct(), capacidadMax);
    }
}