import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  useToast,
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
import axios from "axios";
import { useAuth } from '../auth/AuthContext';

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

function Relatorios() {
  const [entradas, setEntradas] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const toast = useToast();
  const { currentUser } = useAuth();

  const fetchDados = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      const entradasResponse = await axios.get(`http://localhost:8080/api/entradas?userId=${userId}`);
      setEntradas(entradasResponse.data);
      const saidasResponse = await axios.get(`http://localhost:8080/api/saidas?userId=${userId}`);
      setSaidas(saidasResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados dos relatórios:", error);
      toast({
        title: "Erro ao carregar dados.",
        description: "Não foi possível conectar ao servidor.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchDados();
  }, [currentUser]);

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

      <SimpleGrid columns={[1, 3]} spacing={6} mb={8}>
        <Card bg="#2D2D2D">
          <CardBody>
            <Stat>
              <StatLabel color="whiteAlpha.900">Total de Entradas</StatLabel>
              <StatNumber color="green.500">{formatCurrency(totalEntradas)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="#2D2D2D">
          <CardBody>
            <Stat>
              <StatLabel color="whiteAlpha.900">Total de Saídas</StatLabel>
              <StatNumber color="red.500">{formatCurrency(totalSaidas)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="#2D2D2D">
          <CardBody>
            <Stat>
              <StatLabel color="whiteAlpha.900">Saldo</StatLabel>
              <StatNumber color={saldo >= 0 ? "green.500" : "red.500"}>
                {formatCurrency(saldo)}
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