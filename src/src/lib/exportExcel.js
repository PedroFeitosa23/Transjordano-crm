import * as XLSX from 'xlsx';
import { opportunitiesRepo, stagesRepo, leadsRepo } from '@/services/repositories';
import { toast } from 'sonner';

export async function exportAllOperationsToExcel() {
  try {
    const opps = await opportunitiesRepo.list();
    const stages = await stagesRepo.list();
    const leads = await leadsRepo.list();

    const workbook = XLSX.utils.book_new();

    // 1. Criar uma aba no Excel para cada etapa do Funil de Vendas
    stages.forEach((stage) => {
      const stageOpps = opps.filter((o) => o.stageId === stage.id);
      
      const tableData = stageOpps.map((o) => ({
        'ID': o.id,
        'Título do Negócio': o.title,
        'Valor (R$)': (o.valueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        'Prioridade': o.priority === 'high' ? 'Alta' : 'Normal',
        'Origem': o.origin || 'Não informado',
        'Destino': o.destination || 'Não informado',
        'Tipo de Carga': o.cargoType || 'Geral',
        'Volume (ton/mês)': o.volumeTonsMonth || 0,
        'Status': o.status,
        'Data de Criação': o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR') : ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(
        tableData.length > 0 ? tableData : [{ 'Aviso': 'Nenhum negócio nesta etapa' }]
      );

      // Nome da aba no Excel (máximo 31 caracteres)
      const sheetName = stage.name.substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // 2. Criar uma aba exclusiva para Leads & Contatos
    const leadsData = leads.map((l) => ({
      'ID': l.id,
      'Nome da Empresa': l.name,
      'Telefone': l.phone || 'N/A',
      'E-mail': l.email || 'N/A',
      'Score': l.score || 0,
      'Status': l.status || 'Novo'
    }));

    const leadsSheet = XLSX.utils.json_to_sheet(leadsData);
    XLSX.utils.book_append_sheet(workbook, leadsSheet, 'Leads & Contatos');

    // 3. Exportar arquivo .xlsx
    XLSX.writeFile(workbook, `Transjordano_Operacoes_Completo_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Relatório Excel de todas as abas exportado com sucesso!');
  } catch (error) {
    console.error('Erro na exportação:', error);
    toast.error('Falha ao exportar dados para Excel.');
  }
}
