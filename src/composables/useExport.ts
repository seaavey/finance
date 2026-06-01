import { useSupabase } from '@/lib/supabase';

export const useExport = () => {
  const supabase = useSupabase();
  const { t } = useI18n();
  const { toast } = useToast();
  const exporting = ref(false);

  const convertToCSV = (rows: Record<string, unknown>[]) => {
    if (!rows.length || !rows[0]) return '';
    const headers = Object.keys(rows[0]).join(',');
    const content = rows.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    ).join('\n');
    return `${headers}\n${content}`;
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllData = async () => {
    exporting.value = true;
    try {
      const { user } = useAuth();
      if (!user.value) {
        toast.error(t('toast.login_required'));
        return;
      }

      const [txResult, recurringResult, catResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.value.id)
          .order('date', { ascending: false }),
        supabase
          .from('recurring_transactions')
          .select('*')
          .eq('user_id', user.value.id)
          .order('next_date', { ascending: true }),
        supabase.from('categories').select('*').eq('user_id', user.value.id),
      ]);

      const transactions = txResult.data || [];
      const categories = catResult.data || [];
      const catMap = new Map(categories.map((c: { id: string; name: string }) => [c.id, c.name]));

      // Format data for CSV
      const csvData = transactions.map((tx, i) => ({
        [t('export.col_no')]: i + 1,
        [t('export.col_date')]: tx.date,
        [t('export.col_type')]: tx.type === 'income' ? t('export.type_income') : t('export.type_expense'),
        [t('export.col_category')]: catMap.get(tx.category_id) || '-',
        [t('export.col_amount')]: Number(tx.amount),
        [t('export.col_currency')]: tx.currency,
        [t('export.col_description')]: tx.description || '',
      }));

      const csvContent = convertToCSV(csvData);
      const today = new Date().toISOString().split('T')[0];
      
      downloadFile(
        csvContent, 
        `finansiil-export-${today}.csv`, 
        'text/csv;charset=utf-8;'
      );

      toast.success(t('toast.export_success'));
    } catch (e) {
      console.error('Export error:', e);
      toast.error(t('toast.export_error'));
    } finally {
      exporting.value = false;
    }
  };

  return { exportAllData, exporting };
};
