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
  useClipboard, 
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useAuth } from '../auth/AuthContext';


function Configuracoes() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  
  const { currentUser } = useAuth();
  
  const whatsappId = currentUser ? currentUser.uid : "Faça login para ver seu ID";
  
  const { onCopy, hasCopied } = useClipboard(whatsappId);
  

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
    <Box p={6} align="center">
      <Text fontSize="3xl" fontWeight="bold" mb={6} color="white">
        Configurações
      </Text>
      
      {currentUser && (
        <Card maxW="600px" shadow="md" bg="#2D2D2D" mb={8}>
          <CardHeader>
            <Heading size="md" color="white">
              Conexão com o WhatsApp Bot
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text color="whiteAlpha.700">
                Use este ID no WhatsApp com o comando: 
                <Text as="span" fontWeight="bold" color="blue.300"> CONECTAR {'{SEU ID}'}</Text>
              </Text>
              <FormControl>
                <FormLabel color="whiteAlpha.900">Seu ID de Usuário (UID)</FormLabel>
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type="text"
                    value={whatsappId}
                    isReadOnly
                    color="whiteAlpha.900"
                    bg="blackAlpha.300"
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={onCopy} colorScheme={hasCopied ? "green" : "blue"}>
                      {hasCopied ? "Copiado!" : "Copiar"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      )}

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