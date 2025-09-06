import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Heading,
  Center,
  Image,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function CadastroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(email, password);
      toast({
        title: 'Cadastro bem-sucedido!',
        description: 'Sua conta foi criada. Faça login para continuar.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Erro no cadastro.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center bg="#191919" color="white">
      <Box
        p={{ base: 4, sm: 8 }}
        w={{ base: '90%', sm: 'md' }}
        maxW="md"
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="#2D2D2D"
      >
        <VStack spacing={4} align="stretch">
          <Center>
            <Image src="./finanzas_icon.png" boxSize={{ base: "80px", md: "100px" }} alt="FinanZas Icon" />
          </Center>
          <Heading as="h1" size={{ base: 'lg', md: 'xl' }} textAlign="center" mb={4}>
            Criar Nova Conta
          </Heading>
          <form onSubmit={handleCadastro}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  color="whiteAlpha.900"
                  _placeholder={{ color: 'whiteAlpha.600' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Senha</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  color="whiteAlpha.900"
                  _placeholder={{ color: 'whiteAlpha.600' }}
                />
              </FormControl>
              <Button type="submit" colorScheme="green" isLoading={loading} width="full">
                Cadastrar
              </Button>
            </VStack>
          </form>

          <Center>
            <Link as={RouterLink} to="/login" color="whiteAlpha.800" _hover={{ textDecoration: 'underline' }}>
              Já tem uma conta? Faça Login
            </Link>
          </Center>
        </VStack>
      </Box>
    </Center>
  );
}

export default CadastroPage;