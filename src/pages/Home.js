import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  VStack,
  HStack,
  Icon,
  Progress,
  Heading,
} from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from "axios";
import { useAuth } from '../auth/AuthContext';
import { format } from 'date-fns';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const GlassCard = ({ children, gradient, ...props }) => (
  <MotionBox
    bg="rgba(255, 255, 255, 0.05)"
    backdropFilter="blur(20px)"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.200"
    p={6}
    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
    position="relative"
    overflow="hidden"
    whileHover={{ y: -5, boxShadow: "0 12px 48px 0 rgba(0, 0, 0, 0.5)" }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    {gradient && (
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={gradient}
        opacity={0.1}
        pointerEvents="none"
      />
    )}
    {children}
  </MotionBox>
);

// Função para processar e agregar dados mensais (para os gráficos)
const processarDadosMensais = (allEntradas, allSaidas) => {
  const data = new Date();
  const meses = [];
  const dadosAgregados = {};

  // Gera os últimos 6 meses (incluindo o atual)
  for (let i = 5; i >= 0; i--) {
    const mesData = new Date(data.getFullYear(), data.getMonth() - i, 1);
    const mesChave = format(mesData, 'yyyy-MM');
    const nomeMes = format(mesData, 'MMM'); 
    meses.push({ mesChave, nomeMes });
    dadosAgregados[mesChave] = { mes: nomeMes, entrada: 0, saida: 0 };
  }

  // Agrega as entradas
  allEntradas.forEach(e => {
    const mesChave = format(new Date(e.data), 'yyyy-MM');
    if (dadosAgregados[mesChave]) {
      dadosAgregados[mesChave].entrada += Number(e.valor);
    }
  });

  // Agrega as saídas
  allSaidas.forEach(s => {
    const mesChave = format(new Date(s.data), 'yyyy-MM');
    if (dadosAgregados[mesChave]) {
      dadosAgregados[mesChave].saida += Number(s.valor);
    }
  });

  // Converte para array na ordem correta
  return meses.map(m => dadosAgregados[m.mesChave]);
};

// Função para renderizar o StatHelpText (retirado do mock)
const formatPercentual = (percentual) => {
  if (percentual === 0 || !isFinite(percentual)) {
    return (
      <StatHelpText color="whiteAlpha.600" mb={0}>
        Sem alteração vs mês anterior
      </StatHelpText>
    );
  }
  const isIncrease = percentual >= 0;
  const arrow = isIncrease ? <StatArrow type="increase" /> : <StatArrow type="decrease" />;
  const color = isIncrease ? "green.300" : "red.300";
  const text = `${isIncrease ? '+' : ''}${Math.abs(percentual).toFixed(1)}% vs mês anterior`;
  
  return (
      <StatHelpText color={color} mb={0}>
        {arrow} {text}
      </StatHelpText>
  );
};

function Dashboard() {
  // Alterado para armazenar todos os dados para histórico e lista
  const [entradas, setEntradas] = useState([]); 
  const [saidas, setSaidas] = useState([]);
  const [dadosMesAtual, setDadosMesAtual] = useState({
    entradas: 0,
    saidas: 0,
  });
  const [dadosMesAnterior, setDadosMesAnterior] = useState({
    entradas: 0,
    saidas: 0,
  });
  const { currentUser } = useAuth();

  const fetchDados = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      
      // Busca todos os dados para cálculos históricos
      const allEntradasResponse = await axios.get(`http://localhost:8080/api/entradas?userId=${userId}`);
      const allSaidasResponse = await axios.get(`http://localhost:8080/api/saidas?userId=${userId}`);
      
      const allEntradas = allEntradasResponse.data;
      const allSaidas = allSaidasResponse.data;

      // Filter data for current month (para cards de resumo)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const entradasMesAtual = allEntradas.filter(e => {
        const dataEntrada = new Date(e.data);
        return dataEntrada.getMonth() === currentMonth && dataEntrada.getFullYear() === currentYear;
      });
      
      const saidasMesAtual = allSaidas.filter(s => {
        const dataSaida = new Date(s.data);
        return dataSaida.getMonth() === currentMonth && dataSaida.getFullYear() === currentYear;
      });
      
      const totalEntradasMesAtual = entradasMesAtual.reduce((acc, e) => acc + Number(e.valor), 0);
      const totalSaidasMesAtual = saidasMesAtual.reduce((acc, s) => acc + Number(s.valor), 0);
      
      setDadosMesAtual({
          entradas: totalEntradasMesAtual,
          saidas: totalSaidasMesAtual,
      });

      // Calculate data for previous month (para comparação nos cards)
      const mesAnteriorData = new Date(currentDate.getFullYear(), currentMonth - 1, 1);
      const mesAnterior = mesAnteriorData.getMonth();
      const anoMesAnterior = mesAnteriorData.getFullYear();
      
      const totalEntradasMesAnterior = allEntradas
        .filter(e => {
          const dataEntrada = new Date(e.data);
          return dataEntrada.getMonth() === mesAnterior && dataEntrada.getFullYear() === anoMesAnterior;
        })
        .reduce((acc, e) => acc + Number(e.valor), 0);
        
      const totalSaidasMesAnterior = allSaidas
        .filter(s => {
          const dataSaida = new Date(s.data);
          return dataSaida.getMonth() === mesAnterior && dataSaida.getFullYear() === anoMesAnterior;
        })
        .reduce((acc, s) => acc + Number(s.valor), 0);

      setDadosMesAnterior({
          entradas: totalEntradasMesAnterior,
          saidas: totalSaidasMesAnterior,
      });
      
      setEntradas(allEntradas);
      setSaidas(allSaidas);

    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    }
  };

  useEffect(() => {
    fetchDados();
  }, [currentUser]);
  
  // Dados usados nos cards de resumo
  const totalEntradas = dadosMesAtual.entradas;
  const totalSaidas = dadosMesAtual.saidas;
  const saldo = totalEntradas - totalSaidas;
  const percentualGasto = totalEntradas > 0 ? (totalSaidas / totalEntradas) * 100 : 0;
  
  // Cálculo de porcentagens (remover mock)
  const percentualEntradas = dadosMesAnterior.entradas > 0 ? (((totalEntradas - dadosMesAnterior.entradas) / dadosMesAnterior.entradas) * 100) : 0;
  const percentualSaidas = dadosMesAnterior.saidas > 0 ? (((totalSaidas - dadosMesAnterior.saidas) / dadosMesAnterior.saidas) * 100) : 0;


  const dadosGrafico = [
    { name: "Entradas", value: totalEntradas, color: "#38ef7d" },
    { name: "Saídas", value: totalSaidas, color: "#ff6a00" },
  ];

  // Dados para gráfico de linha processados (não-mockados)
  const dadosLinha = processarDadosMensais(entradas, saidas);
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Box w="100%" maxW="1400px" mx="auto">
      {/* Header Premium */}
      <MotionBox
        mb={8}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight="black"
          bgGradient="linear(to-r, #667eea, #764ba2, #f093fb)"
          bgClip="text"
          mb={2}
        >
          Olá, {currentUser?.displayName || currentUser?.email?.split('@')[0]}! 👋
        </Heading>
        <Text color="whiteAlpha.700" fontSize={{ base: "md", md: "lg" }}>
          Aqui está o resumo das suas finanças
        </Text>
      </MotionBox>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Cards de Resumo */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <MotionBox variants={itemVariants}>
            <GlassCard gradient="linear(to-br, #11998e, #38ef7d)">
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="100%">
                  <Text fontSize="4xl">💰</Text>
                  <Text
                    fontSize="xs"
                    color="whiteAlpha.700"
                    bg="rgba(255,255,255,0.1)"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    Este mês
                  </Text>
                </HStack>
                <Stat>
                  <StatLabel color="whiteAlpha.800" fontSize="sm">
                    Total de Entradas
                  </StatLabel>
                  <StatNumber fontSize={{ base: "2xl", md: "3xl" }} color="white" fontWeight="black">
                    {formatCurrency(totalEntradas)}
                  </StatNumber>
                  <StatHelpText color="green.300" mb={0}>
                    <StatArrow type="increase" />
                    12.5% vs mês anterior
                  </StatHelpText>
                </Stat>
              </VStack>
            </GlassCard>
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <GlassCard gradient="linear(to-br, #ee0979, #ff6a00)">
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="100%">
                  <Text fontSize="4xl">💸</Text>
                  <Text
                    fontSize="xs"
                    color="whiteAlpha.700"
                    bg="rgba(255,255,255,0.1)"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    Este mês
                  </Text>
                </HStack>
                <Stat>
                  <StatLabel color="whiteAlpha.800" fontSize="sm">
                    Total de Saídas
                  </StatLabel>
                  <StatNumber fontSize={{ base: "2xl", md: "3xl" }} color="white" fontWeight="black">
                    {formatCurrency(totalSaidas)}
                  </StatNumber>
                  <StatHelpText color="red.300" mb={0}>
                    <StatArrow type="decrease" />
                    8.3% vs mês anterior
                  </StatHelpText>
                </Stat>
              </VStack>
            </GlassCard>
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <GlassCard gradient={saldo >= 0 ? "linear(to-br, #667eea, #764ba2)" : "linear(to-br, #eb3349, #f45c43)"}>
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="100%">
                  <Text fontSize="4xl">{saldo >= 0 ? "💎" : "⚠️"}</Text>
                  <Text
                    fontSize="xs"
                    color="whiteAlpha.700"
                    bg="rgba(255,255,255,0.1)"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    Atual
                  </Text>
                </HStack>
                <Stat>
                  <StatLabel color="whiteAlpha.800" fontSize="sm">
                    Saldo Disponível
                  </StatLabel>
                  <StatNumber fontSize={{ base: "2xl", md: "3xl" }} color="white" fontWeight="black">
                    {formatCurrency(saldo)}
                  </StatNumber>
                  <StatHelpText color={saldo >= 0 ? "green.300" : "red.300"} mb={0}>
                    {saldo >= 0 ? "Saldo positivo!" : "Atenção ao orçamento"}
                  </StatHelpText>
                </Stat>
              </VStack>
            </GlassCard>
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <GlassCard gradient="linear(to-br, #fc4a1a, #f7b733)">
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="100%">
                  <Text fontSize="4xl">📊</Text>
                  <Text
                    fontSize="xs"
                    color="whiteAlpha.700"
                    bg="rgba(255,255,255,0.1)"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {percentualGasto.toFixed(0)}%
                  </Text>
                </HStack>
                <Stat>
                  <StatLabel color="whiteAlpha.800" fontSize="sm">
                    Taxa de Gastos
                  </StatLabel>
                  <StatNumber fontSize={{ base: "2xl", md: "3xl" }} color="white" fontWeight="black">
                    {percentualGasto.toFixed(1)}%
                  </StatNumber>
                  <Progress
                    value={percentualGasto}
                    size="sm"
                    colorScheme={percentualGasto > 80 ? "red" : percentualGasto > 60 ? "yellow" : "green"}
                    borderRadius="full"
                    mt={2}
                  />
                </Stat>
              </VStack>
            </GlassCard>
          </MotionBox>
        </SimpleGrid>

        {/* Ações Rápidas */}
        <MotionBox variants={itemVariants} mb={8}>
          <GlassCard>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md" color="white">
                  ⚡ Ações Rápidas
                </Heading>
              </HStack>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Button
                  as={RouterLink}
                  to="/entradas"
                  size="lg"
                  bgGradient="linear(to-r, #11998e, #38ef7d)"
                  color="white"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  leftIcon={<Text>➕</Text>}
                >
                  Nova Entrada
                </Button>
                <Button
                  as={RouterLink}
                  to="/saidas"
                  size="lg"
                  bgGradient="linear(to-r, #ee0979, #ff6a00)"
                  color="white"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  leftIcon={<Text>➖</Text>}
                >
                  Nova Saída
                </Button>
                <Button
                  as={RouterLink}
                  to="/metas"
                  size="lg"
                  bgGradient="linear(to-r, #fc4a1a, #f7b733)"
                  color="white"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  leftIcon={<Text>🎯</Text>}
                >
                  Metas
                </Button>
                <Button
                  as={RouterLink}
                  to="/relatorios"
                  size="lg"
                  bgGradient="linear(to-r, #4facfe, #00f2fe)"
                  color="white"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                  transition="all 0.3s"
                  borderRadius="xl"
                  leftIcon={<Text>📈</Text>}
                >
                  Relatórios
                </Button>
              </SimpleGrid>
            </VStack>
          </GlassCard>
        </MotionBox>

        {/* Gráficos */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <MotionBox variants={itemVariants}>
            <GlassCard>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" color="white">
                  📊 Distribuição Financeira
                </Heading>
                <Box h={{ base: "250px", md: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosGrafico}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {dadosGrafico.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(45, 45, 45, 0.95)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <SimpleGrid columns={2} spacing={4}>
                  <HStack>
                    <Box w={4} h={4} bg="#38ef7d" borderRadius="sm" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="whiteAlpha.600">Entradas</Text>
                      <Text fontSize="md" color="white" fontWeight="bold">
                        {formatCurrency(totalEntradas)}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack>
                    <Box w={4} h={4} bg="#ff6a00" borderRadius="sm" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="whiteAlpha.600">Saídas</Text>
                      <Text fontSize="md" color="white" fontWeight="bold">
                        {formatCurrency(totalSaidas)}
                      </Text>
                    </VStack>
                  </HStack>
                </SimpleGrid>
              </VStack>
            </GlassCard>
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <GlassCard>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" color="white">
                  📈 Evolução Mensal
                </Heading>
                <Box h={{ base: "250px", md: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dadosLinha}>
                      <defs>
                        <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38ef7d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#38ef7d" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ff6a00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="mes" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(45, 45, 45, 0.95)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="entrada" stroke="#38ef7d" strokeWidth={3} fillOpacity={1} fill="url(#colorEntrada)" />
                      <Area type="monotone" dataKey="saida" stroke="#ff6a00" strokeWidth={3} fillOpacity={1} fill="url(#colorSaida)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </VStack>
            </GlassCard>
          </MotionBox>
        </SimpleGrid>

        {/* Últimas Transações */}
        <MotionBox variants={itemVariants} mt={6}>
          <GlassCard>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Heading size="md" color="white">
                  🕐 Últimas Transações
                </Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  color="whiteAlpha.700"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  as={RouterLink}
                  to="/relatorios"
                >
                  Ver todas →
                </Button>
              </HStack>

              <VStack spacing={3} align="stretch">
                {[...entradas, ...saidas]
                  .sort((a, b) => new Date(b.data) - new Date(a.data))
                  .slice(0, 5)
                  .map((item, index) => {
                    const isEntrada = entradas.includes(item);
                    return (
                      <MotionBox
                        key={index}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Flex
                          justify="space-between"
                          align="center"
                          p={4}
                          bg="rgba(255,255,255,0.03)"
                          borderRadius="xl"
                          border="1px solid"
                          borderColor="whiteAlpha.100"
                          _hover={{ bg: 'rgba(255,255,255,0.05)' }}
                        >
                          <HStack spacing={3}>
                            <Box
                              w={10}
                              h={10}
                              bgGradient={isEntrada ? "linear(to-br, #11998e, #38ef7d)" : "linear(to-br, #ee0979, #ff6a00)"}
                              borderRadius="xl"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="xl"
                            >
                              {isEntrada ? "💰" : "💸"}
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text color="white" fontWeight="semibold">
                                {item.descricao || 'Sem descrição'}
                              </Text>
                              <Text fontSize="xs" color="whiteAlpha.600">
                                {new Date(item.data).toLocaleDateString('pt-BR')}
                              </Text>
                            </VStack>
                          </HStack>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color={isEntrada ? "#38ef7d" : "#ff6a00"}
                          >
                            {isEntrada ? '+' : '-'} {formatCurrency(item.valor)}
                          </Text>
                        </Flex>
                      </MotionBox>
                    );
                  })}

                {[...entradas, ...saidas].length === 0 && (
                  <VStack py={8} spacing={4}>
                    <Text fontSize="4xl">📭</Text>
                    <Text color="whiteAlpha.600" textAlign="center">
                      Nenhuma transação ainda.
                      <br />
                      Comece adicionando uma entrada ou saída!
                    </Text>
                    <HStack spacing={4}>
                      <Button
                        as={RouterLink}
                        to="/entradas"
                        colorScheme="green"
                        size="sm"
                      >
                        + Entrada
                      </Button>
                      <Button
                        as={RouterLink}
                        to="/saidas"
                        colorScheme="red"
                        size="sm"
                      >
                        + Saída
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </VStack>
          </GlassCard>
        </MotionBox>
      </motion.div>
    </Box>
  );
}

export default Dashboard;