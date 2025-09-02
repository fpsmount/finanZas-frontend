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
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({
        title: 'Login bem-sucedido!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Erro no login.',
        description: 'Verifique seu e-mail e senha.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: 'Login com Google bem-sucedido!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Erro no login com Google.',
        description: 'Não foi possível autenticar com o Google.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg="#191919" color="white">
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
            FinanZas
          </Heading>
          <form onSubmit={handleEmailLogin}>
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
              <Button type="submit" colorScheme="blue" isLoading={loading} width="full">
                Entrar
              </Button>
            </VStack>
          </form>

          <Divider orientation="horizontal" my={4} />

          <Button colorScheme="red" onClick={handleGoogleLogin} isLoading={loading} width="full">
            Entrar com Google
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}

export default LoginPage;