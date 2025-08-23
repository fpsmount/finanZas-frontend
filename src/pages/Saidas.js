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
  Select,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovaSaida({
      ...novaSaida,
      [name]: value,
    });
  };

  const adicionarSaida = () => {
    setSaidas([...saidas, { ...novaSaida, id: Date.now() }]);
    setNovaSaida({ descricao: "", valor: "", data: "", tipo: "variável" });
    setMostrarFormulario(false);
  };

  const confirmarExclusao = (id) => {
    setSaidaParaExcluir(id);
    onOpen();
  };

  const excluirSaida = () => {
    setSaidas(saidas.filter((saida) => saida.id !== saidaParaExcluir));
    setSaidaParaExcluir(null);
    onClose();
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Saídas
        </Text>
        <Button colorScheme="red" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          Nova Saída
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
            placeholder="Valor"
            name="valor"
            type="number"
            value={novaSaida.valor}
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
            _placeholder={{ color: "whiteAlpha.600" }}
          >
            <option value="fixa">Fixa</option>
            <option value="variável">Variável</option>
          </Select>
          <Button colorScheme="blue" onClick={adicionarSaida}>
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
            <Th color="whiteAlpha.900">Tipo</Th>
            <Th color="whiteAlpha.900">Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {saidas.map((saida) => (
            <Tr key={saida.id}>
              <Td color="whiteAlpha.900">{saida.descricao}</Td>
              <Td color="whiteAlpha.900">R$ {saida.valor}</Td>
              <Td color="whiteAlpha.900">{saida.data}</Td>
              <Td color="whiteAlpha.900">{saida.tipo}</Td>
              <Td>
                <HStack spacing={2}>
                  <Button size="sm" colorScheme="yellow">
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => confirmarExclusao(saida.id)}
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