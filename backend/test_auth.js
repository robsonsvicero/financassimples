// Testes básicos de autenticação usando supertest e jest
const request = require('supertest');
const express = require('express');
const app = require('./index.js');

describe('Autenticação', () => {
  it('deve recusar cadastro sem dados', async () => {
    const res = await request(app).post('/api/register').send({});
    expect(res.statusCode).toBe(400);
  });

  it('deve recusar login sem dados', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.statusCode).toBe(400);
  });

  // Adicione mais testes conforme necessário
});
