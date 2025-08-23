import { Text, VStack, Button } from "@chakra-ui/react";

function Sair() {
  return (
    <VStack spacing={6} mt="100px">
      <Text fontSize="3xl" fontWeight="bold" color="white" textAlign="center">
        Bem-vindo ao FinanZas, seu novo gerenciador financeiro
      </Text>
      <Text fontSize="lg" color="gray.400" textAlign="center">
        Aqui você verá seu resumo financeiro, gráficos e mais funcionalidades!
      </Text>
      <Button colorScheme="purple" size="lg">
        Nova Transação
      </Button>
    </VStack>
  );
}

export default Sair;
