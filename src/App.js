import {
  Box,
  Flex,
  HStack,
  Button,
  Text,
  VStack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  useToast,
} from '@chakra-ui/react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Link,
  useNavigate,
} from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';

import Home from './pages/Home';
import Entradas from './pages/Entradas';
import Saidas from './pages/Saidas';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import LoginPage from './pages/Login'; 
import CadastroPage from './pages/Cadastro';
import ProtectedRoutes from './ProtectedRoutes'

import { AuthProvider, useAuth } from './auth/AuthContext';

// Importação do novo componente Metas
import Metas from './pages/Metas'; 

const menuItems = [
  { name: 'Home', path: '/' },
  { name: 'Entradas', path: '/entradas' },
  { name: 'Saídas', path: '/saidas' },
  { name: 'Metas', path: '/metas' }, // Novo item de menu para Metas
  { name: 'Relatórios', path: '/relatorios' },
  { name: 'Configurações', path: '/configuracoes' },
];

function Navigation() {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logout bem-sucedido!',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Erro ao fazer logout.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      as="nav"
      bg="transparent"
      pt="40px"
      px={{ base: 4, md: 8 }}
      pb={8}
      justify="center"
      align="center"
      color="white"
    >
      <Box position="absolute" left={{ base: 4, md: '30px' }}>
        <Link to="/">
          <Text fontSize="2xl" fontWeight="bold">
            FinanZas
          </Text>
        </Link>
      </Box>

      {currentUser && isDesktop ? (
        <HStack spacing={6}>
          {menuItems.map((item) => (
            <Button
              key={item.name}
              as={Link}
              to={item.path}
              variant="link"
              color={location.pathname === item.path ? 'white' : 'whiteAlpha.700'}
              fontWeight={location.pathname === item.path ? 'bold' : 'normal'}
              _hover={{ textDecoration: 'underline', color: 'white' }}
            >
              {item.name}
            </Button>
          ))}
          <Button colorScheme="red" onClick={handleLogout}>
            Sair
          </Button>
        </HStack>
      ) : currentUser ? (
        <>
          <IconButton
            aria-label="Abrir menu"
            icon={<HamburgerIcon />}
            onClick={onOpen}
            variant="ghost"
            color="white"
            position="absolute"
            right={{ base: 4, md: '30px' }}
            _hover={{ bg: 'whiteAlpha.300' }}
          />
          <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent bg="#191919" color="white">
              <DrawerCloseButton />
              <DrawerBody>
                <VStack spacing={6} mt={10} align="stretch">
                  {menuItems.map((item) => (
                    <Button key={item.name} as={Link} to={item.path} variant="link" color={location.pathname === item.path ? 'white' : 'whiteAlpha.700'} fontWeight={location.pathname === item.path ? 'bold' : 'normal'} _hover={{ textDecoration: 'underline', color: 'white' }} onClick={onClose} w="100%">
                      {item.name}
                    </Button>
                  ))}
                  <Button colorScheme="red" onClick={() => { handleLogout(); onClose(); }}>
                    Sair
                  </Button>
                </VStack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      ) : null}
    </Flex>
  );
}

function App() {
  return (
    <Box minHeight="100vh" bg="#191919">
      <Router>
        <AuthProvider>
          <Navigation />
          <Flex justify="center" align="center" px={8} pb={12}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<CadastroPage />} />
              <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<Home />} />
                <Route path="/entradas" element={<Entradas />} />
                <Route path="/saidas" element={<Saidas />} />
                <Route path="/metas" element={<Metas />} /> {/* Nova Rota para Metas Financeiras */}
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
              </Route>
            </Routes>
          </Flex>
        </AuthProvider>
      </Router>
    </Box>
  );
}

export default App;