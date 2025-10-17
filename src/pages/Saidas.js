import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from '../auth/AuthContext';


const formatInputCurrency = (value) => {
    if (!value && value !== 0) return '';
    
    const numericValue = Number(value);
    
    const fixed = numericValue.toFixed(2);
    
    const parts = fixed.split('.');
    
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    const decimalPart = parts[1];
    
    return `${integerPart},${decimalPart}`;
};

function Saidas() {
  const [saidas, setSaidas] = useState([]);
  const [novaSaida, setNovaSaida] = useState({
    descricao: "",
    valor: "", 
    data: "",
    tipo: "variável",
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [saidaParaExcluir, setSaidaParaExcluir] = useState(null);
  const [saidaParaEditar, setSaidaParaEditar] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { currentUser } = useAuth(); 

  const fetchSaidas = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      const response = await axios.get(`https://finanzas-backend-rmik.onrender.com/api/saidas?userId=${userId}`);
      setSaidas(response.data);
    } catch (error) {
      console.error("Erro ao buscar saídas:", error);
      toast({
        title: "Erro ao carregar saídas.",
        description: "Não foi possível conectar ao servidor.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchSaidas();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'valor') {
        const digits = value.replace(/\D/g, ''); 

        const newNumericValue = digits === '' ? '' : (Number(digits) / 100);
        
        setNovaSaida({
            ...novaSaida,
            valor: newNumericValue, 
        });
        return;
    }

    setNovaSaida({
      ...novaSaida,
      [name]: value,
    });
  };

  const adicionarSaida = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    if (novaSaida.valor === '' || isNaN(novaSaida.valor) || Number(novaSaida.valor) <= 0) {
        toast({ title: "O valor da saída deve ser maior que zero.", status: "error", duration: 3000 });
        return;
    }
    
    const payload = { 
      ...novaSaida, 
      userId,
      valor: Number(novaSaida.valor), 
    };

    try {
      if (saidaParaEditar) {
        await axios.put(`https://finanzas-backend-rmik.onrender.com/api/saidas/${saidaParaEditar.id}?userId=${userId}`, payload);
        toast({ title: "Saída editada com sucesso!", status: "success", duration: 3000 });
      } else {
        await axios.post(`https://finanzas-backend-rmik.onrender.com/api/saidas?userId=${userId}`, payload);
        toast({ title: "Saída adicionada com sucesso!", status: "success", duration: 3000 });
      }
      setNovaSaida({ descricao: "", valor: "", data: "", tipo: "variável" });
      setMostrarFormulario(false);
      setSaidaParaEditar(null);
      fetchSaidas();
    } catch (error) {
      console.error("Erro ao salvar saída:", error);
      toast({ title: "Erro ao salvar saída.", status: "error", duration: 3000 });
    }
  };

  const iniciarEdicao = (saida) => {
    setNovaSaida({
      ...saida,
      valor: Number(saida.valor),
    });
    setSaidaParaEditar(saida);
    setMostrarFormulario(true);
  };

  const confirmarExclusao = (id) => {
    setSaidaParaExcluir(id);
    onOpen();
  };

  const excluirSaida = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    try {
      await axios.delete(`https://finanzas-backend-rmik.onrender.com/api/saidas/${saidaParaExcluir}?userId=${userId}`);
      toast({ title: "Saída excluída com sucesso.", status: "info", duration: 3000 });
      setSaidaParaExcluir(null);
      onClose();
      fetchSaidas();
    } catch (error) {
      console.error("Erro ao excluir saída:", error);
      toast({ title: "Erro ao excluir saída.", status: "error", duration: 3000 });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatType = (typeString) => {
    if(typeString === 'variável'){
      return 'Variável';
    } else {
      return 'Fixa'
    }
  }

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Saídas
        </Text>
        <Button colorScheme="red" onClick={() => {
          setMostrarFormulario(!mostrarFormulario);
          setNovaSaida({ descricao: "", valor: "", data: "", tipo: "variável" });
          setSaidaParaEditar(null);
        }}>
          {mostrarFormulario ? "Cancelar" : "Nova Saída"}
        </Button>
      </HStack>

      {mostrarFormulario && (
        <VStack spacing={3} p={4} borderWidth="1px" borderRadius="lg" mb={6} align="start" borderColor="whiteAlpha.400">
          <Input
            placeholder="Descrição"
            name="descricao"
            value={novaSaida.descricao}
            onChange={handleChange}
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.600" }}
          />
          <Input
            placeholder="Valor (R$)"
            name="valor"
            type="text"
            value={formatInputCurrency(novaSaida.valor)}
            onChange={handleChange}
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.600" }}
          />
          <Input
            placeholder="Data"
            name="data"
            type="date"
            value={novaSaida.data}
            onChange={handleChange}
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.600" }}
          />
          <Select
            name="tipo"
            value={novaSaida.tipo}
            onChange={handleChange}
            color="whiteAlpha.900"
          >
            <option value="fixa">Fixa</option>
            <option value="variável">Variável</option>
          </Select>
          <Button colorScheme="blue" onClick={adicionarSaida}>
            {saidaParaEditar ? "Salvar Edição" : "Adicionar"}
          </Button>
        </VStack>
      )}

      {isMobile ? (
        <VStack spacing={4} align="stretch">
          {saidas.map((saida) => (
            <Box
              key={saida.id}
              p={4}
              bg="#2D2D2D"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="whiteAlpha.400"
            >
              <HStack justify="space-between">
                <Text fontWeight="bold" color="whiteAlpha.900">
                  {saida.descricao}
                </Text>
                <Text fontWeight="bold" color="red.300">
                  {formatCurrency(saida.valor)}
                </Text>
              </HStack>
              <HStack justify="space-between" mt={2}>
                <Text fontSize="sm" color="whiteAlpha.700">
                  {formatDate(saida.data)}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.700">
                  Tipo: {formatType(saida.tipo)}
                </Text>
              </HStack>
              <HStack justify="flex-end" mt={4} spacing={2}>
                <Button size="sm" colorScheme="yellow" onClick={() => iniciarEdicao(saida)}>
                  Editar
                </Button>
                <Button size="sm" colorScheme="red" onClick={() => confirmarExclusao(saida.id)}>
                  Excluir
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      ) : (
        <Box overflowX={{ base: "auto", md: "hidden" }}>
          <Table variant="simple" bg="#2D2D2D" borderColor="whiteAlpha.400">
            <Thead>
              <Tr>
                <Th color="whiteAlpha.900">Descrição</Th>
                <Th color="whiteAlpha.900">Valor</Th>
                <Th color="whiteAlpha.900">Data</Th>
                <Th color="whiteAlpha.900">Tipo</Th>
                <Th color="whiteAlpha.900">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {saidas.map((saida) => (
                <Tr key={saida.id}>
                  <Td color="whiteAlpha.900">{saida.descricao}</Td>
                  <Td color="whiteAlpha.900">{formatCurrency(saida.valor)}</Td>
                  <Td color="whiteAlpha.900">{formatDate(saida.data)}</Td>
                  <Td color="whiteAlpha.900">{formatType(saida.tipo)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button size="sm" colorScheme="yellow" onClick={() => iniciarEdicao(saida)}>
                        Editar
                      </Button>
                      <Button size="sm" colorScheme="red" onClick={() => confirmarExclusao(saida.id)}>
                        Excluir
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirmar Exclusão
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir esta saída?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={excluirSaida} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default Saidas;