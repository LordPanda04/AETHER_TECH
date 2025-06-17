import React, { useState } from 'react';
import Axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

app.post("/", (req, res) => {
  const nombre = req.body.nombre;
  const codigo_barras = req.body.codigo_barras;
  const descripcion = req.body.descripcion;
  const categoria = req.body.categoria;
  const unidad_medida = req.body.unidad_medida;
  const precio_compra = req.body.precio_compra;
  const stock_min = req.body.stock_min;
  const stock_max = req.body.stock_max;
  const stock_actual = req.body.stock_actual;

  db.query(
    'INSERT INTO productos (nombre, codigo_barras, descripcion, categoria, unidad_medida, precio_compra, stock_min, stock_max, stock_actual) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nombre, codigo_barras, descripcion, categoria, unidad_medida, precio_compra, stock_min, stock_max, stock_actual],
    (error, results) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.status(201).send({ id: results.insertId });
    }
  );
});