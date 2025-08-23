import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Switch,
  Divider,
  useColorMode,
  HStack,
  Link,
} from "@chakra-ui/react";

function Configuracoes() {
  const [nome, setNome] = useState("Usuário Exemplo");
  const [email, setEmail] = useState("usuario@email.com");
  const [senha, setSenha] = useState("");
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleSalvar = () => {
    toast({
      title: "Configurações salvas!",
      description: "Suas informações foram atualizadas com sucesso.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setSenha("");
  };

  const handleToggleColorMode = () => {
    toggleColorMode();
    toast({
      title: `Modo ${colorMode === 'light' ? 'Escuro' : 'Claro'} ativado.`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box p={6}>
      <Text fontSize="3xl" fontWeight="bold" mb={6} color="white">
        Configurações
      </Text>

      <Card maxW="600px" shadow="md" bg="#2D2D2D" mb={8}>
        <CardHeader>
          <Heading size="md" color="white">Informações do Usuário</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel color="whiteAlpha.900">Nome</FormLabel>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome"
                color="whiteAlpha.900"
                _placeholder={{ color: "whiteAlpha.600" }}
              />
            </FormControl>
            <FormControl>
              <FormLabel color="whiteAlpha.900">Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                color="whiteAlpha.900"
                _placeholder={{ color: "whiteAlpha.600" }}
              />
            </FormControl>
            <FormControl>
              <FormLabel color="whiteAlpha.900">Senha</FormLabel>
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite uma nova senha"
                color="whiteAlpha.900"
                _placeholder={{ color: "whiteAlpha.600" }}
              />
            </FormControl>
            <Button colorScheme="blue" onClick={handleSalvar}>
              Salvar Alterações
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <Card maxW="600px" shadow="md" bg="#2D2D2D" mb={8}>
        <CardHeader>
          <Heading size="md" color="white">Aparência</Heading>
        </CardHeader>
        <CardBody>
          <HStack justify="space-between" align="center">
            <Text color="whiteAlpha.900">Modo Escuro / Claro</Text>
            <Switch
              isChecked={colorMode === 'dark'}
              onChange={handleToggleColorMode}
              colorScheme="purple"
            />
          </HStack>
        </CardBody>
      </Card>

      <Card maxW="600px" shadow="md" bg="#2D2D2D">
        <CardHeader>
          <Heading size="md" color="white">Suporte</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text color="whiteAlpha.900">
              Precisa de ajuda? Entre em contato com nossa equipe de suporte.
            </Text>
            <Button as={Link} href="mailto:suporte@finanzas.com" colorScheme="purple">
              Entrar em Contato
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}

export default Configuracoes;