import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useBreakpointValue,
  useToast,
  Progress,
  Select,
} from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";

// Função utilitária para formatar o valor monetário no input (R$ 1.000,00)
const formatInputCurrency = (value) => {
  if (value === "" || value === null || isNaN(value)) return "";
  const numericValue = Number(value);
  const fixed = numericValue.toFixed(2);
  const parts = fixed.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalPart = parts[1];
  return `${integerPart},${decimalPart}`;
};

// Função utilitária para exibir o valor monetário
const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

// Função utilitária para formatar a data (AAAA-MM-DD para DD/MM/AAAA)
const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

function Metas() {
  const [metas, setMetas] = useState([]);
  const [novaMeta, setNovaMeta] = useState({
    nomeMeta: "",
    valorObjetivo: "",
    valorAtual: "",
    dataLimite: "",
    categoria: "viagem", // Categoria padrão
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [metaParaExcluir, setMetaParaExcluir] = useState(null);
  const [metaParaEditar, setMetaParaEditar] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const { currentUser } = useAuth();
  const baseUrl = "http://localhost:8080/api/metas";

  const fetchMetas = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      const response = await axios.get(`${baseUrl}?userId=${userId}`);
      setMetas(response.data);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
      // Omitido o toast de erro para não ser muito intrusivo
    }
  };

  useEffect(() => {
    fetchMetas();
  }, [currentUser]);

  // Função para lidar com a mudança nos campos de input (incluindo tratamento de moeda)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "valorObjetivo" || name === "valorAtual") {
      // Remove caracteres não numéricos, exceto a vírgula/ponto para tratamento
      const digits = value.replace(/\D/g, "");
      // Divide por 100 para transformar em valor decimal
      const newNumericValue = digits === "" ? "" : Number(digits) / 100;
      setNovaMeta((prev) => ({
        ...prev,
        [name]: newNumericValue,
      }));
      return;
    }

    setNovaMeta((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const adicionarMeta = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    const { valorObjetivo, valorAtual, nomeMeta, dataLimite } = novaMeta;

    if (!nomeMeta || !dataLimite || valorObjetivo === "" || isNaN(valorObjetivo) || Number(valorObjetivo) <= 0) {
      toast({
        title: "Preencha todos os campos corretamente.",
        description: "O Nome e o Valor Objetivo são obrigatórios.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Validação extra: valor atual não pode ser maior que o objetivo
    if (Number(valorAtual) > Number(valorObjetivo)) {
        toast({
            title: "Valor Atual inválido.",
            description: "O valor economizado não pode ser maior que o objetivo.",
            status: "error",
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    const payload = {
      ...novaMeta,
      userId,
      // Converte para Number, mas o Backend converte para BigDecimal
      valorObjetivo: Number(valorObjetivo), 
      valorAtual: Number(valorAtual) || 0,
    };

    try {
      if (metaParaEditar) {
        // Requisição PUT para editar
        await axios.put(
          `${baseUrl}/${metaParaEditar.id}?userId=${userId}`,
          payload
        );
        toast({ title: "Meta editada com sucesso!", status: "success", duration: 3000 });
      } else {
        // Requisição POST para criar
        await axios.post(
          `${baseUrl}?userId=${userId}`,
          payload
        );
        toast({ title: "Meta adicionada com sucesso!", status: "success", duration: 3000 });
      }

      // Limpa e fecha o formulário
      setNovaMeta({ nomeMeta: "", valorObjetivo: "", valorAtual: "", dataLimite: "", categoria: "viagem" });
      setMostrarFormulario(false);
      setMetaParaEditar(null);
      fetchMetas(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      toast({ title: "Erro ao salvar meta.", status: "error", duration: 3000 });
    }
  };

  const iniciarEdicao = (meta) => {
    // Popula o formulário com os dados da meta
    setNovaMeta({
        ...meta,
        // Garante que os valores sejam numéricos para o state
        valorObjetivo: Number(meta.valorObjetivo),
        valorAtual: Number(meta.valorAtual),
    });
    setMetaParaEditar(meta);
    setMostrarFormulario(true);
  };

  const confirmarExclusao = (id) => {
    setMetaParaExcluir(id);
    onOpen();
  };

  const excluirMeta = async () => {
    if (!currentUser || !metaParaExcluir) return;
    const userId = currentUser.uid;
    try {
      // Requisição DELETE
      await axios.delete(
        `${baseUrl}/${metaParaExcluir}?userId=${userId}`
      );
      toast({ title: "Meta excluída com sucesso.", status: "info", duration: 3000 });
      setMetaParaExcluir(null);
      onClose();
      fetchMetas(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
      toast({ title: "Erro ao excluir meta.", status: "error", duration: 3000 });
    }
  };
  
  // Cálculo dos totais para o resumo
  const totalGeral = metas.reduce((acc, meta) => acc + Number(meta.valorObjetivo), 0);
  const totalAtual = metas.reduce((acc, meta) => acc + Number(meta.valorAtual), 0);
  const percentualGeral = totalGeral > 0 ? (totalAtual / totalGeral) * 100 : 0;

  return (
    <Box p={6}>
      <VStack spacing={4} align="stretch" maxW="1200px" mx="auto">
        <Text fontSize="3xl" fontWeight="bold" color="white" mb={2}>
          Metas Financeiras
        </Text>

        {/* Card de Resumo Global */}
        <Box 
            p={5}
            bg="#2D2D2D"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="whiteAlpha.400"
            shadow="lg"
        >
            <HStack justify="space-between" mb={2} wrap="wrap">
                <VStack align="start" spacing={0}>
                    <Text fontSize="lg" fontWeight="semibold" color="whiteAlpha.800">
                        Total Economizado: {formatCurrency(totalAtual)}
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold" color="whiteAlpha.800">
                        Total Objetivo: {formatCurrency(totalGeral)}
                    </Text>
                </VStack>
                <Button
                    colorScheme="purple"
                    onClick={() => {
                        setMostrarFormulario(!mostrarFormulario);
                        setNovaMeta({ nomeMeta: "", valorObjetivo: "", valorAtual: "", dataLimite: "", categoria: "viagem" });
                        setMetaParaEditar(null);
                    }}
                >
                    {mostrarFormulario ? "Cancelar" : "Nova Meta"}
                </Button>
            </HStack>
            <Progress 
                value={Math.min(100, percentualGeral)} 
                size="md" 
                colorScheme={percentualGeral >= 100 ? "green" : "purple"} 
                mt={2} 
                borderRadius="md" 
            />
        </Box>


        {/* Formulário de Cadastro/Edição */}
        {mostrarFormulario && (
          <VStack
            spacing={3}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            mt={4}
            align="start"
            borderColor="whiteAlpha.400"
          >
            <Text fontSize="xl" fontWeight="bold" color="white">
                {metaParaEditar ? "Editar Meta" : "Cadastrar Nova Meta"}
            </Text>
            <Input
              placeholder="Nome da Meta (ex: Viagem para Europa)"
              name="nomeMeta"
              value={novaMeta.nomeMeta}
              onChange={handleChange}
              color="whiteAlpha.900"
              _placeholder={{ color: "whiteAlpha.600" }}
              bg="whiteAlpha.100"
              borderColor="whiteAlpha.300"
            />
            <HStack w="100%" spacing={3} wrap="wrap">
                <Input
                    placeholder="Valor Objetivo (R$)"
                    name="valorObjetivo"
                    type="text"
                    value={formatInputCurrency(novaMeta.valorObjetivo)}
                    onChange={handleChange}
                    color="whiteAlpha.900"
                    _placeholder={{ color: "whiteAlpha.600" }}
                    bg="whiteAlpha.100"
                    borderColor="whiteAlpha.300"
                    flex="1"
                />
                <Input
                    placeholder="Valor Atual Economizado (R$)"
                    name="valorAtual"
                    type="text"
                    value={formatInputCurrency(novaMeta.valorAtual)}
                    onChange={handleChange}
                    color="whiteAlpha.900"
                    _placeholder={{ color: "whiteAlpha.600" }}
                    bg="whiteAlpha.100"
                    borderColor="whiteAlpha.300"
                    flex="1"
                />
            </HStack>
            
            <Select
                name="categoria"
                value={novaMeta.categoria}
                onChange={handleChange}
                color="whiteAlpha.900"
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.300"
                _placeholder={{ color: "whiteAlpha.600" }}
            >
                <option value="viagem" style={{backgroundColor: '#191919'}}>Viagem</option>
                <option value="reserva" style={{backgroundColor: '#191919'}}>Reserva de Emergência</option>
                <option value="compra" style={{backgroundColor: '#191919'}}>Compra Específica</option>
                <option value="investimento" style={{backgroundColor: '#191919'}}>Investimento</option>
                <option value="outros" style={{backgroundColor: '#191919'}}>Outros</option>
            </Select>
            
            <DatePicker
                selected={novaMeta.dataLimite ? new Date(novaMeta.dataLimite.replace(/-/g, '/')) : null}
                onChange={(date) =>
                    setNovaMeta({
                        ...novaMeta,
                        // Converte a data para o formato YYYY-MM-DD para o Spring Boot
                        dataLimite: date ? date.toISOString().split("T")[0] : "",
                    })
                }
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                placeholderText="Data Limite"
                customInput={
                    <Input
                        color="whiteAlpha.900"
                        _placeholder={{ color: "whiteAlpha.600" }}
                        bg="whiteAlpha.100"
                        borderColor="whiteAlpha.300"
                    />
                }
                calendarStartDay={1}
                minDate={new Date()} // Impede datas passadas
            />

            <Button colorScheme="purple" onClick={adicionarMeta} w="100%">
              {metaParaEditar ? "Salvar Edição" : "Adicionar Meta"}
            </Button>
          </VStack>
        )}
        
        <Text fontSize="2xl" fontWeight="bold" color="white" mt={6} mb={4}>
            Lista de Metas ({metas.length})
        </Text>

        {/* Lista de Metas (Cards) */}
        <VStack spacing={6} align="stretch">
            {metas.length === 0 ? (
                <Text color="whiteAlpha.600">Nenhuma meta cadastrada. Adicione sua primeira meta!</Text>
            ) : (
                metas.sort((a, b) => new Date(a.dataLimite) - new Date(b.dataLimite)).map((meta) => {
                    const percentual = (Number(meta.valorAtual) / Number(meta.valorObjetivo)) * 100;
                    const progressValue = Math.min(100, percentual);
                    const progressColor = percentual >= 100 ? "green" : "purple";

                    return (
                        <Box
                            key={meta.id}
                            p={5}
                            bg="#2D2D2D"
                            borderRadius="lg"
                            borderWidth="1px"
                            borderColor="whiteAlpha.400"
                            shadow="md"
                        >
                            <HStack justify="space-between" mb={2} align="flex-start" wrap="wrap">
                                <Text fontSize="xl" fontWeight="bold" color="whiteAlpha.900">
                                    {meta.nomeMeta}
                                </Text>
                                <HStack spacing={2}>
                                    <Button size="sm" colorScheme="yellow" onClick={() => iniciarEdicao(meta)}>
                                        Editar
                                    </Button>
                                    <Button size="sm" colorScheme="red" onClick={() => confirmarExclusao(meta.id)}>
                                        Excluir
                                    </Button>
                                </HStack>
                            </HStack>

                            <Text fontSize="md" color="whiteAlpha.700">
                                Categoria: {meta.categoria.charAt(0).toUpperCase() + meta.categoria.slice(1)} | Limite: {formatDate(meta.dataLimite)}
                            </Text>
                            
                            <Text fontSize="lg" fontWeight="semibold" mt={3} color="whiteAlpha.900">
                                {formatCurrency(meta.valorAtual)} / {formatCurrency(meta.valorObjetivo)} ({progressValue.toFixed(1)}%)
                            </Text>
                            
                            <Progress value={progressValue} size="lg" colorScheme={progressColor} mt={2} borderRadius="md" />

                            {percentual >= 100 && (
                                <Text mt={2} color="green.300" fontWeight="bold">
                                    Meta Concluída! 🎉
                                </Text>
                            )}
                        </Box>
                    );
                })
            )}
        </VStack>

      </VStack>

      {/* AlertDialog para Confirmação de Exclusão */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="#2D2D2D" color="white">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirmar Exclusão
            </AlertDialogHeader>
            <AlertDialogBody>Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={excluirMeta} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default Metas;