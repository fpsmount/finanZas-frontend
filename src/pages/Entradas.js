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
  Switch,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  useBreakpointValue,
} from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from '../auth/AuthContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";


const formatInputCurrency = (value) => {
    if (!value && value !== 0) return '';
    
    const numericValue = Number(value);
    
    const fixed = numericValue.toFixed(2);
    
    const parts = fixed.split('.');
    
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    const decimalPart = parts[1];
    
    return `${integerPart},${decimalPart}`;
};


function Entradas() {
  const [entradas, setEntradas] = useState([]);
  const [novaEntrada, setNovaEntrada] = useState({
    descricao: "",
    valor: "", 
    data: "",
    salario: false,
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [entradaParaExcluir, setEntradaParaExcluir] = useState(null);
  const [entradaParaEditar, setEntradaParaEditar] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { currentUser } = useAuth(); 

  const fetchEntradas = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      const response = await axios.get(`http://localhost:8080/api/entradas?userId=${userId}`);
      setEntradas(response.data);
    } catch (error) {
      console.error("Erro ao buscar entradas:", error);
      toast({
        title: "Erro ao carregar entradas.",
        description: "Não foi possível conectar ao servidor.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchEntradas();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'valor') {
        const digits = value.replace(/\D/g, ''); 

        const newNumericValue = digits === '' ? '' : (Number(digits) / 100);
        
        setNovaEntrada({
            ...novaEntrada,
            valor: newNumericValue, 
        });
        return;
    }

    setNovaEntrada({
      ...novaEntrada,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const adicionarEntrada = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    if (novaEntrada.valor === '' || isNaN(novaEntrada.valor) || Number(novaEntrada.valor) <= 0) {
        toast({ title: "O valor da entrada deve ser maior que zero.", status: "error", duration: 3000 });
        return;
    }
    
    const payload = { 
      ...novaEntrada, 
      userId,
      valor: Number(novaEntrada.valor), 
    };

    try {
      if (entradaParaEditar) {
        await axios.put(`http://localhost:8080/api/entradas/${entradaParaEditar.id}?userId=${userId}`, payload);
        toast({ title: "Entrada editada com sucesso!", status: "success", duration: 3000 });
      } else {
        await axios.post(`http://localhost:8080/api/entradas?userId=${userId}`, payload);
        toast({ title: "Entrada adicionada com sucesso!", status: "success", duration: 3000 });
      }
      setNovaEntrada({ descricao: "", valor: "", data: "", salario: false });
      setMostrarFormulario(false);
      setEntradaParaEditar(null);
      fetchEntradas();
    } catch (error) {
      console.error("Erro ao salvar entrada:", error);
      toast({ title: "Erro ao salvar entrada.", status: "error", duration: 3000 });
    }
  };

  const iniciarEdicao = (entrada) => {
    setNovaEntrada({
      ...entrada,
      valor: Number(entrada.valor),
    });
    setEntradaParaEditar(entrada);
    setMostrarFormulario(true);
  };

  const confirmarExclusao = (id) => {
    setEntradaParaExcluir(id);
    onOpen();
  };

  const excluirEntrada = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    try {
      await axios.delete(`http://localhost:8080/api/entradas/${entradaParaExcluir}?userId=${userId}`);
      toast({ title: "Entrada excluída com sucesso.", status: "info", duration: 3000 });
      setEntradaParaExcluir(null);
      onClose();
      fetchEntradas();
    } catch (error) {
      console.error("Erro ao excluir entrada:", error);
      toast({ title: "Erro ao excluir entrada.", status: "error", duration: 3000 });
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

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Entradas
        </Text>
        <Button colorScheme="green" onClick={() => {
          setMostrarFormulario(!mostrarFormulario);
          setNovaEntrada({ descricao: "", valor: "", data: "", salario: false });
          setEntradaParaEditar(null);
        }}>
          {mostrarFormulario ? "Cancelar" : "Nova Entrada"}
        </Button>
      </HStack>

      {mostrarFormulario && (
        <VStack spacing={3} p={4} borderWidth="1px" borderRadius="lg" mb={6} align="start" borderColor="whiteAlpha.400">
          <Input
            placeholder="Descrição"
            name="descricao"
            value={novaEntrada.descricao}
            onChange={handleChange}
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.600" }}
          />
          <Input
            placeholder="Valor (R$)"
            name="valor"
            type="text" 
            value={formatInputCurrency(novaEntrada.valor)} 
            onChange={handleChange}
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.600" }}
          />
          <Box w="100%">
  <DatePicker
    selected={novaEntrada.data ? new Date(novaEntrada.data) : null}
    onChange={(date) =>
      setNovaEntrada({
        ...novaEntrada,
        data: date ? date.toISOString().split("T")[0] : "",
      })
    }
    dateFormat="dd/MM/yyyy"
    locale={ptBR}
    placeholderText="Selecione uma data"
    customInput={
      <Input
        color="whiteAlpha.900"
        _placeholder={{ color: "whiteAlpha.600" }}
      />
    }
    calendarStartDay={1}
  />
</Box>
          <HStack>
            <Text color="whiteAlpha.900">Recebimento de Salário?</Text>
            <Switch
              name="salario"
              isChecked={novaEntrada.salario}
              onChange={(e) =>
                setNovaEntrada({ ...novaEntrada, salario: e.target.checked })
              }
            />
          </HStack>
          <Button colorScheme="blue" onClick={adicionarEntrada}>
            {entradaParaEditar ? "Salvar Edição" : "Adicionar"}
          </Button>
        </VStack>
      )}

      {isMobile ? (
        <VStack spacing={4} align="stretch">
          {entradas.map((entrada) => (
            <Box
              key={entrada.id}
              p={4}
              bg="#2D2D2D"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="whiteAlpha.400"
            >
              <HStack justify="space-between">
                <Text fontWeight="bold" color="whiteAlpha.900">
                  {entrada.descricao}
                </Text>
                <Text fontWeight="bold" color="green.300">
                  {formatCurrency(entrada.valor)}
                </Text>
              </HStack>
              <HStack justify="space-between" mt={2}>
                <Text fontSize="sm" color="whiteAlpha.700">
                  {formatDate(entrada.data)}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.700">
                  Salário: {entrada.salario ? "Sim" : "Não"}
                </Text>
              </HStack>
              <HStack justify="flex-end" mt={4} spacing={2}>
                <Button size="sm" colorScheme="yellow" onClick={() => iniciarEdicao(entrada)}>
                  Editar
                </Button>
                <Button size="sm" colorScheme="red" onClick={() => confirmarExclusao(entrada.id)}>
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
                <Th color="whiteAlpha.900">Salário</Th>
                <Th color="whiteAlpha.900">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {entradas.map((entrada) => (
                <Tr key={entrada.id}>
                  <Td color="whiteAlpha.900">{entrada.descricao}</Td>
                  <Td color="whiteAlpha.900">{formatCurrency(entrada.valor)}</Td>
                  <Td color="whiteAlpha.900">{formatDate(entrada.data)}</Td>
                  <Td color="whiteAlpha.900">{entrada.salario ? "Sim" : "Não"}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button size="sm" colorScheme="yellow" onClick={() => iniciarEdicao(entrada)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => confirmarExclusao(entrada.id)}
                      >
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
              Tem certeza que deseja excluir esta entrada?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={excluirEntrada} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default Entradas;