import {
  Box,
  Flex,
  HStack,
  Button,
  Text,
  VStack
} from '@chakra-ui/react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Link
} from 'react-router-dom';

import Home from './pages/Home';
import Entradas from './pages/Entradas';
import Saidas from './pages/Saidas';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';

const menuItems = [
  { name: 'Home', path: '/' },
  { name: 'Entradas', path: '/entradas' },
  { name: 'Saídas', path: '/saidas' },
  { name: 'Relatórios', path: '/relatorios' },
  { name: 'Configurações', path: '/configuracoes' }
];

function Navigation() {
  const location = useLocation();

  return (
    <Flex
      as="nav"
      bg="transparent"
      pt="40px"
      px={8}
      pb={8}
      justify="center"
      align="center"
      color="white"
    >
      <Box position="absolute" left="30px">
        <Text fontSize="2xl" fontWeight="bold">
          FinanZas
        </Text>
      </Box>

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
      </HStack>
    </Flex>
  );
}

function App() {
  return (
    <Box minHeight="100vh" bg="#191919">
      <Router>
        <Navigation />

        <Flex justify="center" align="center" px={8} pb={12}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/entradas" element={<Entradas />} />
            <Route path="/saidas" element={<Saidas />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </Flex>
      </Router>
    </Box>
  );
}

export default App;
