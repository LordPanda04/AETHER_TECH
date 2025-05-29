package sgatc;

import java.util.ArrayList;
import java.util.List;

public class AlmacenService {
    private List<Almacen> almacenes;

    public AlmacenService() {
        this.almacenes = new ArrayList<>();
    }

    public void agregarAlmacen(Almacen almacen) {
        almacenes.add(almacen);
    }

    public Almacen buscarAlmacen(String id) {
        return almacenes.stream()
                .filter(a -> a.getIdAlmacen().equals(id))
                .findFirst()
                .orElse(null);
    }

    public List<Almacen> listarAlmacenes() {
        return new ArrayList<>(almacenes);
    }

    public boolean hayEspacioDisponible(Almacen almacen, int cantidad) {
        return (almacen.getCapacidadAct() + cantidad) <= almacen.getCapacidadMax();
    }

    public void inicializarDatos() {
        agregarAlmacen(new Almacen("ALM-001", 1000, "Refrigerado"));
        agregarAlmacen(new Almacen("ALM-002", 2000, "Seco"));
    }
}