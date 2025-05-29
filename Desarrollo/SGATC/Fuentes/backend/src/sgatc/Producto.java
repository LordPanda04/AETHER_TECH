package sgatc;

import java.util.Date;

public class Producto {
    private String codigo;
    private String nombre;
    private String categoria;
    private double precio;
    private Date fechaVencimiento;
    private String numeroLote;

    public Producto(String codigo, String nombre, String categoria, double precio, 
                  Date fechaVencimiento, String numeroLote) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.fechaVencimiento = fechaVencimiento;
        this.numeroLote = numeroLote;
    }

    // Getters y Setters
    public String getCodigo() { return codigo; }
    public String getNombre() { return nombre; }
    public String getCategoria() { return categoria; }
    public double getPrecio() { return precio; }
    public Date getFechaVencimiento() { return fechaVencimiento; }
    public String getNumeroLote() { return numeroLote; }

    @Override
    public String toString() {
        return String.format("%s - %s ($%.2f)", codigo, nombre, precio);
    }
}