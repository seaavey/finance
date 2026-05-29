import ExcelJS from 'exceljs';
import { useSupabase } from '~/lib/supabase';

export const useExport = () => {
  const supabase = useSupabase();
  const { t } = useI18n();
  const { toast } = useToast();
  const exporting = ref(false);

  const frequencyLabels: Record<string, string> = {
    daily: t('export.frequency_daily'),
    weekly: t('export.frequency_weekly'),
    monthly: t('export.frequency_monthly'),
    yearly: t('export.frequency_yearly'),
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
      const recurring = recurringResult.data || [];
      const categories = catResult.data || [];

      const catMap = new Map(categories.map((c: { id: string; name: string }) => [c.id, c.name]));

      const workbook = new ExcelJS.Workbook();
      workbook.created = new Date();
      workbook.creator = t('export.creator');

      const headerFont = { bold: true, color: { argb: 'FFFFFFFF' } } as const;
      const headerFill = {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FF6366F1' },
      };

      // Sheet 1: Transaksi
      const txSheet = workbook.addWorksheet(t('export.sheet_transactions'));
      txSheet.columns = [
        { header: t('export.col_no'), key: 'no', width: 5 },
        { header: t('export.col_date'), key: 'date', width: 14 },
        { header: t('export.col_type'), key: 'type', width: 14 },
        { header: t('export.col_category'), key: 'category', width: 20 },
        { header: t('export.col_amount'), key: 'amount', width: 18 },
        { header: t('export.col_currency'), key: 'currency', width: 10 },
        { header: t('export.col_description'), key: 'description', width: 35 },
      ];

      const txHeader = txSheet.getRow(1);
      txHeader.font = headerFont;
      txHeader.fill = headerFill;

      for (const [i, tx] of transactions.entries()) {
        txSheet.addRow({
          no: i + 1,
          date: tx.date,
          type: tx.type === 'income' ? t('export.type_income') : t('export.type_expense'),
          category: catMap.get(tx.category_id) || '-',
          amount: Number(tx.amount),
          currency: tx.currency,
          description: tx.description || '',
        });
      }

      // Sheet 2: Transaksi Rutin
      const recSheet = workbook.addWorksheet(t('export.sheet_recurring'));
      recSheet.columns = [
        { header: t('export.col_no'), key: 'no', width: 5 },
        { header: t('export.col_type'), key: 'type', width: 14 },
        { header: t('export.col_amount'), key: 'amount', width: 18 },
        { header: t('export.col_currency'), key: 'currency', width: 10 },
        { header: t('export.col_frequency'), key: 'frequency', width: 14 },
        { header: t('export.col_next_date'), key: 'next_date', width: 16 },
        { header: t('export.col_active'), key: 'active', width: 8 },
        { header: t('export.col_description'), key: 'description', width: 35 },
      ];

      const recHeader = recSheet.getRow(1);
      recHeader.font = headerFont;
      recHeader.fill = headerFill;

      for (const [i, r] of recurring.entries()) {
        recSheet.addRow({
          no: i + 1,
          type: r.type === 'income' ? t('export.type_income') : t('export.type_expense'),
          amount: Number(r.amount),
          currency: r.currency,
          frequency: frequencyLabels[r.frequency] || r.frequency,
          next_date: r.next_date,
          active: r.active ? t('export.yes') : t('export.no'),
          description: r.description || '',
        });
      }

      // Sheet 3: Kategori
      const catSheet = workbook.addWorksheet(t('export.sheet_categories'));
      catSheet.columns = [
        { header: t('export.col_no'), key: 'no', width: 5 },
        { header: t('export.col_name'), key: 'name', width: 22 },
        { header: t('export.col_type'), key: 'type', width: 14 },
        { header: t('export.col_color'), key: 'color', width: 12 },
      ];

      const catHeader = catSheet.getRow(1);
      catHeader.font = headerFont;
      catHeader.fill = headerFill;

      for (const [i, c] of categories.entries()) {
        catSheet.addRow({
          no: i + 1,
          name: c.name,
          type: c.type === 'income' ? t('export.type_income') : t('export.type_expense'),
          color: c.color,
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download = `finansiil-export-${today}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(t('toast.export_success'));
    } catch {
      toast.error(t('toast.export_error'));
    } finally {
      exporting.value = false;
    }
  };

  return { exportAllData, exporting };
};
