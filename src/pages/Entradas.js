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
} from "@chakra-ui/react";
import axios from "axios";

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

  const fetchEntradas = async () => {
    try {
      const response = await axios.get("https://finanzas-backend-rmik.onrender.com/api/entradas");
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
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNovaEntrada({
      ...novaEntrada,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const adicionarEntrada = async () => {
    try {
      if (entradaParaEditar) {
        await axios.put(`https://finanzas-backend-rmik.onrender.com/api/entradas/${entradaParaEditar.id}`, novaEntrada);
        toast({ title: "Entrada editada com sucesso!", status: "success", duration: 3000 });
      } else {
        await axios.post("https://finanzas-backend-rmik.onrender.com/api/entradas", novaEntrada);
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
    setNovaEntrada(entrada);
    setEntradaParaEditar(entrada);
    setMostrarFormulario(true);
  };

  const confirmarExclusao = (id) => {
    setEntradaParaExcluir(id);
    onOpen();
  };

  const excluirEntrada = async () => {
    try {
      await axios.delete(`https://finanzas-backend-rmik.onrender.com/api/entradas/${entradaParaExcluir}`);
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
        <Button colorScheme="green" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
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
            placeholder="Valor"
            name="valor"
            type="number"
            value={novaEntrada.valor}
            onChange={handleChange}
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.600" }}
          />
          <Input
            placeholder="Data"
            name="data"
            type="date"
            value={novaEntrada.data}
            onChange={handleChange}
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.600" }}
          />
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