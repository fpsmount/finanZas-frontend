import React, { useState } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Relatorios() {
  const [entradas] = useState([
    { descricao: "Salário", valor: 3000 },
    { descricao: "Freelance", valor: 1200 },
  ]);
  const [saidas] = useState([
    { descricao: "Aluguel", valor: 1500, tipo: "fixa" },
    { descricao: "Supermercado", valor: 800, tipo: "variável" },
    { descricao: "Lazer", valor: 400, tipo: "variável" },
  ]);

  const totalEntradas = entradas.reduce((acc, e) => acc + Number(e.valor), 0);
  const totalSaidas = saidas.reduce((acc, s) => acc + Number(s.valor), 0);
  const saldo = totalEntradas - totalSaidas;

  const dataBarras = [
    { name: "Entradas", valor: totalEntradas },
    { name: "Saídas", valor: totalSaidas },
  ];
  
  const fixas = saidas.filter((s) => s.tipo === "fixa").reduce((acc, s) => acc + Number(s.valor), 0);
  const variaveis = saidas.filter((s) => s.tipo === "variável").reduce((acc, s) => acc + Number(s.valor), 0);
  const dataPizza = [
    { name: "Fixas", value: fixas },
    { name: "Variáveis", value: variaveis },
  ];

  const dataFixasVariaveis = [
    { name: "Fixas", valor: fixas },
    { name: "Variáveis", valor: variaveis },
  ];

  const COLORS = ["#3182CE", "#E53E3E"];

  return (
    <Box p={6}>
      <Text fontSize="2xl" fontWeight="bold" mb={6} color="white">
        Relatórios Financeiros
      </Text>

      <SimpleGrid columns={[1, 3]} spacing={6} mb={8}>
        <Card bg="#2D2D2D">
          <CardBody>
            <Stat>
              <StatLabel color="whiteAlpha.900">Total de Entradas</StatLabel>
              <StatNumber color="green.500">R$ {totalEntradas}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="#2D2D2D">
          <CardBody>
            <Stat>
              <StatLabel color="whiteAlpha.900">Total de Saídas</StatLabel>
              <StatNumber color="red.500">R$ {totalSaidas}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="#2D2D2D">
          <CardBody>
            <Stat>
              <StatLabel color="whiteAlpha.900">Saldo</StatLabel>
              <StatNumber color={saldo >= 0 ? "green.500" : "red.500"}>
                R$ {saldo}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={[1, 2]} spacing={6}>
        <Card bg="#2D2D2D">
          <CardBody>
            <Text fontSize="lg" mb={4} fontWeight="bold" color="white">
              Entradas vs Saídas
            </Text>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dataBarras}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#3182CE" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card bg="#2D2D2D">
          <CardBody>
            <Text fontSize="lg" mb={4} fontWeight="bold" color="white">
              Distribuição de Despesas (Fixas vs Variáveis)
            </Text>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dataFixasVariaveis}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#E53E3E" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card bg="#2D2D2D">
          <CardBody>
            <Text fontSize="lg" mb={4} fontWeight="bold" color="white">
              Proporção de Despesas
            </Text>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dataPizza}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {dataPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}

export default Relatorios;