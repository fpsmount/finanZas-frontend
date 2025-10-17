import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  Button,
  Stack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Link as RouterLink } from 'react-router-dom';
import axios from "axios";
import { useAuth } from '../auth/AuthContext';

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const WelcomeCard = () => (
  <Card bg="#2D2D2D" p={6} mb={10}>
    <VStack spacing={4} align="center">
      <Text fontSize="2xl" fontWeight="bold" color="white">
        Bem-vindo ao FinanZas!
      </Text>
      <Text color="whiteAlpha.700" textAlign="center">
        Comece a gerenciar suas finanças registrando uma transação.
      </Text>
      <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
        <Button as={RouterLink} to="/entradas" colorScheme="green">
          Registrar uma Entrada
        </Button>
        <Button as={RouterLink} to="/saidas" colorScheme="red">
          Registrar uma Saída
        </Button>
      </Stack>
    </VStack>
  </Card>
);

const MiniRelatorioModal = ({ isOpen, onClose, data, title }) => (
  <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }} scrollBehavior="inside">
    <ModalOverlay />
    <ModalContent bg="#191919" color="white">
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Box overflowX="auto">
          <Table variant="simple" colorScheme="whiteAlpha">
            <Thead>
              <Tr>
                <Th color="whiteAlpha.900">Descrição</Th>
                <Th color="whiteAlpha.900" isNumeric>Valor</Th>
                <Th color="whiteAlpha.900">Data</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item) => (
                <Tr key={item.id}>
                  <Td color="whiteAlpha.900">{item.descricao}</Td>
                  <Td color="whiteAlpha.900" isNumeric>{formatCurrency(item.valor)}</Td>
                  <Td color="whiteAlpha.900">{item.data}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" onClick={onClose}>
          Fechar
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

function Dashboard() {
  const { isOpen: isEntradasOpen, onOpen: onEntradasOpen, onClose: onEntradasClose } = useDisclosure();
  const { isOpen: isSaidasOpen, onOpen: onSaidasOpen, onClose: onSaidasClose } = useDisclosure();

  const [entradas, setEntradas] = useState([]);
  const [saidas, setSaidas] = useState([]);
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
      console.error("Erro ao buscar dados do dashboard:", error);
    }
  };

  useEffect(() => {
    fetchDados();
  }, [currentUser]);

  const totalEntradas = entradas.reduce((acc, e) => acc + Number(e.valor), 0);
  const totalSaidas = saidas.reduce((acc, s) => acc + Number(s.valor), 0);
  const saldo = totalEntradas - totalSaidas;

  const dadosGrafico = [
    { name: "Entradas", value: totalEntradas },
    { name: "Saídas", value: totalSaidas },
  ];

  const cores = ["#2ecc71", "#e74c3c"];

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Box maxW="1200px" mx="auto">

        <WelcomeCard />

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
          <Card bg="#2D2D2D" cursor="pointer" onClick={onEntradasOpen}>
            <CardBody>
              <Stat>
                <StatLabel color="whiteAlpha.900">Entradas</StatLabel>
                <StatNumber color="green.500">{formatCurrency(totalEntradas)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="#2D2D2D" cursor="pointer" onClick={onSaidasOpen}>
            <CardBody>
              <Stat>
                <StatLabel color="whiteAlpha.900">Saídas</StatLabel>
                <StatNumber color="red.500">{formatCurrency(totalSaidas)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="#2D2D2D">
            <CardBody>
              <Stat>
                <StatLabel color="whiteAlpha.900">Saldo</StatLabel>
                <StatNumber
                  color={saldo >= 0 ? "green.600" : "red.600"}
                >
                  {formatCurrency(saldo)}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Box w="100%" h={{ base: "250px", md: "300px" }} bg="#2D2D2D" rounded="md" shadow="md" p={4}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dadosGrafico}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {dadosGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={cores[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <MiniRelatorioModal
        isOpen={isEntradasOpen}
        onClose={onEntradasClose}
        data={entradas}
        title="Mini-Relatório de Entradas"
      />
      <MiniRelatorioModal
        isOpen={isSaidasOpen}
        onClose={onSaidasClose}
        data={saidas}
        title="Mini-Relatório de Saídas"
      />
    </Box>
  );
}

export default Dashboard;