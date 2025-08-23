import React, { useState } from "react";
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
} from "@chakra-ui/react";

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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNovaEntrada({
      ...novaEntrada,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const adicionarEntrada = () => {
    setEntradas([...entradas, { ...novaEntrada, id: Date.now() }]);
    setNovaEntrada({ descricao: "", valor: "", data: "", salario: false });
    setMostrarFormulario(false);
  };

  const confirmarExclusao = (id) => {
    setEntradaParaExcluir(id);
    onOpen();
  };

  const excluirEntrada = () => {
    setEntradas(entradas.filter((entrada) => entrada.id !== entradaParaExcluir));
    setEntradaParaExcluir(null);
    onClose();
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Entradas
        </Text>
        <Button colorScheme="green" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          Nova Entrada
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
            Adicionar
          </Button>
        </VStack>
      )}

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
              <Td color="whiteAlpha.900">R$ {entrada.valor}</Td>
              <Td color="whiteAlpha.900">{entrada.data}</Td>
              <Td color="whiteAlpha.900">{entrada.salario ? "Sim" : "Não"}</Td>
              <Td>
                <HStack spacing={2}>
                  <Button size="sm" colorScheme="yellow">
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

      {/* Modal de Confirmação para Exclusão */}
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