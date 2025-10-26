import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  useToast,
  Button,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axios from "axios";
import { useAuth } from '../auth/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = dateString instanceof Date ? dateString : new Date(dateString + 'T00:00:00'); 
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
};

function Relatorios() {
  const [entradas, setEntradas] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();
  const { currentUser } = useAuth();

  const fetchDados = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.uid;
      const entradasResponse = await axios.get(`http://localhost:8080/api/entradas?userId=${userId}`);
      setEntradas(entradasResponse.data);
      const saidasResponse = await axios.get(`http://localhost:8080/api/saidas?userId=${userId}`);
      setSaidas(saidasResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados dos relatórios:", error);
      toast({
        title: "Erro ao carregar dados.",
        description: "Não foi possível conectar ao servidor.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchDados();
  }, [currentUser]);

  const totalEntradas = entradas.reduce((acc, e) => acc + Number(e.valor), 0);
  const totalSaidas = saidas.reduce((acc, s) => acc + Number(s.valor), 0);
  const saldo = totalEntradas - totalSaidas;

  const dataBarras = [
    { name: "Entradas", valor: totalEntradas },
    { name: "Saídas", valor: totalSaidas },
  ];

  const fixas = saidas.filter((s) => s.tipo === "fixa").reduce((acc, s) => acc + Number(s.valor), 0);
  const variaveis = saidas.filter((s) => s.tipo === "variável").reduce((acc, s) => acc + Number(s.valor), 0);
  const dataPizza = [
    { name: "Fixas", value: fixas },
    { name: "Variáveis", value: variaveis },
  ];
  
  const dataFixasVariaveis = [
    { name: "Fixas", valor: fixas },
    { name: "Variáveis", valor: variaveis },
  ];

  const COLORS = ["#3182CE", "#E53E3E"]; 


  const handleExportPDF = () => {
    setIsGenerating(true);
    const input = document.getElementById('relatorio-content'); 
    
    html2canvas(input, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#191919', 
    }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); 
        const imgWidth = 210; 
        const pageHeight = 295; 
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        let position = 0;

        pdf.setFillColor(25, 25, 25); 
        pdf.rect(0, 0, 210, 297, 'F'); 

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        
        pdf.addPage();
        
        pdf.setFillColor(25, 25, 25); 
        pdf.rect(0, 0, 210, 297, 'F'); 

        pdf.setFontSize(22);
        pdf.setTextColor(255, 255, 255);
        pdf.text("Detalhes de Entradas e Saídas", 14, 20);

        let startY = 30;
        
        const entradasColumns = [
            { header: 'Data', dataKey: 'data' },
            { header: 'Descrição', dataKey: 'descricao' },
            { header: 'Valor', dataKey: 'valor' },
            { header: 'Salário', dataKey: 'salario' },
        ];

        const entradasRows = entradas.map(e => ({
            data: formatDate(e.data),
            descricao: e.descricao || '',
            valor: formatCurrency(e.valor),
            salario: e.salario ? 'Sim' : 'Não',
        }));

        pdf.autoTable({
            startY: startY + 5,
            head: [entradasColumns.map(col => col.header)],
            body: entradasRows.map(row => Object.values(row).map(v => v ?? "")),
            theme: 'striped',
            headStyles: { fillColor: [49, 130, 206], textColor: 255 }, 
            styles: { fontSize: 10, cellPadding: 2, textColor: 255, lineColor: 60, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [45, 45, 45] }, 
            bodyStyles: { fillColor: [60, 60, 60] }, 
            margin: { top: 10, left: 10, right: 10 },
            didDrawPage: (data) => {
                pdf.setFontSize(14);
                pdf.text("Entradas Detalhadas:", data.settings.margin.left, data.cursor.y + 10);
            }
        });
        
        startY = pdf.lastAutoTable.finalY;

        const saidasColumns = [
            { header: 'Data', dataKey: 'data' },
            { header: 'Descrição', dataKey: 'descricao' },
            { header: 'Valor', dataKey: 'valor' },
            { header: 'Tipo', dataKey: 'tipo' },
            { header: 'Categoria', dataKey: 'categoria' },
        ];

        const saidasRows = saidas.map(s => ({
            data: formatDate(s.data),
            descricao: s.descricao || '',
            valor: formatCurrency(s.valor),
            tipo: s.tipo ? s.tipo.charAt(0).toUpperCase() + s.tipo.slice(1) : '',
            categoria: s.categoria ? s.categoria.charAt(0).toUpperCase() + s.categoria.slice(1) : '',
        }));

        pdf.autoTable({
            startY: startY + 20,
            head: [saidasColumns.map(col => col.header)],
            body: saidasRows.map(row => Object.values(row).map(v => v ?? "")),
            theme: 'striped',
            headStyles: { fillColor: [229, 62, 62], textColor: 255 }, 
            styles: { fontSize: 10, cellPadding: 2, textColor: 255, lineColor: 60, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [45, 45, 45] }, 
            bodyStyles: { fillColor: [60, 60, 60] }, 
            margin: { top: 10, left: 10, right: 10 },
            didDrawPage: (data) => {
                pdf.setFontSize(14);
                pdf.text("Saídas Detalhadas:", data.settings.margin.left, data.cursor.y + 10);
            }
        });

        pdf.save(`relatorio_finanzas_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsGenerating(false);
        toast({
            title: "Relatório gerado!",
            description: "O arquivo PDF foi baixado com sucesso. Ele contém a visão geral e os detalhes.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });
    }).catch(error => {
        console.error("Erro ao gerar PDF:", error);
        setIsGenerating(false);
        toast({
            title: "Erro na exportação.",
            description: "Não foi possível gerar o PDF. Verifique o console para detalhes.",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    });
  };


  return (
    <Box p={{ base: 4, md: 6 }}>
        
        <HStack justify="space-between" mb={8} align="center" maxW="1200px" mx="auto">
            <Text fontSize="3xl" fontWeight="bold" color="white">
                Relatórios e Análises
            </Text>
            <Button
                colorScheme="teal"
                onClick={handleExportPDF}
                isLoading={isGenerating} 
                loadingText="Gerando PDF"
                leftIcon={isGenerating ? <Spinner size="sm" /> : null}
            >
                Exportar PDF Detalhado
            </Button>
        </HStack>

      <Box id="relatorio-content"> 

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
          <Card bg="#2D2D2D">
            <CardBody>
              <Stat>
                <StatLabel color="whiteAlpha.900">Total de Entradas</StatLabel>
                <StatNumber color="green.500">{formatCurrency(totalEntradas)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="#2D2D2D">
            <CardBody>
              <Stat>
                <StatLabel color="whiteAlpha.900">Total de Saídas</StatLabel>
                <StatNumber color="red.500">{formatCurrency(totalSaidas)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="#2D2D2D">
            <CardBody>
              <Stat>
                <StatLabel color="whiteAlpha.900">Saldo</StatLabel>
                <StatNumber color={saldo >= 0 ? "green.500" : "red.500"}>
                  {formatCurrency(saldo)}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card bg="#2D2D2D">
            <CardBody>
              <Text fontSize="lg" mb={4} fontWeight="bold" color="white">
                Entradas vs Saídas
              </Text>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dataBarras}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#3182CE" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card bg="#2D2D2D">
            <CardBody>
              <Text fontSize="lg" mb={4} fontWeight="bold" color="white">
                Distribuição de Despesas (Fixas vs Variáveis)
              </Text>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dataFixasVariaveis}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#E53E3E" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card bg="#2D2D2D">
            <CardBody>
              <Text fontSize="lg" mb={4} fontWeight="bold" color="white">
                Proporção de Despesas
              </Text>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dataPizza}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {dataPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </Box>
  );
}

export default Relatorios;