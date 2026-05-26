import ExcelJS from 'exceljs';
import { useSupabase } from '~/lib/supabase';

export const useExport = () => {
  const supabase = useSupabase();
  const { t } = useI18n();
  const { toast } = useToast();
  const exporting = ref(false);

  const frequencyLabels: Record<string, string> = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
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
      workbook.creator = 'Finansiil';

      const headerFont = { bold: true, color: { argb: 'FFFFFFFF' } } as const;
      const headerFill = {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FF6366F1' },
      };

      // Sheet 1: Transaksi
      const txSheet = workbook.addWorksheet('Transaksi');
      txSheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Tanggal', key: 'date', width: 14 },
        { header: 'Tipe', key: 'type', width: 14 },
        { header: 'Kategori', key: 'category', width: 20 },
        { header: 'Jumlah', key: 'amount', width: 18 },
        { header: 'Mata Uang', key: 'currency', width: 10 },
        { header: 'Deskripsi', key: 'description', width: 35 },
      ];

      const txHeader = txSheet.getRow(1);
      txHeader.font = headerFont;
      txHeader.fill = headerFill;

      for (const [i, tx] of transactions.entries()) {
        txSheet.addRow({
          no: i + 1,
          date: tx.date,
          type: tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          category: catMap.get(tx.category_id) || '-',
          amount: Number(tx.amount),
          currency: tx.currency,
          description: tx.description || '',
        });
      }

      // Sheet 2: Transaksi Rutin
      const recSheet = workbook.addWorksheet('Transaksi Rutin');
      recSheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Tipe', key: 'type', width: 14 },
        { header: 'Jumlah', key: 'amount', width: 18 },
        { header: 'Mata Uang', key: 'currency', width: 10 },
        { header: 'Frekuensi', key: 'frequency', width: 14 },
        { header: 'Tgl Berikutnya', key: 'next_date', width: 16 },
        { header: 'Aktif', key: 'active', width: 8 },
        { header: 'Deskripsi', key: 'description', width: 35 },
      ];

      const recHeader = recSheet.getRow(1);
      recHeader.font = headerFont;
      recHeader.fill = headerFill;

      for (const [i, r] of recurring.entries()) {
        recSheet.addRow({
          no: i + 1,
          type: r.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          amount: Number(r.amount),
          currency: r.currency,
          frequency: frequencyLabels[r.frequency] || r.frequency,
          next_date: r.next_date,
          active: r.active ? 'Ya' : 'Tidak',
          description: r.description || '',
        });
      }

      // Sheet 3: Kategori
      const catSheet = workbook.addWorksheet('Kategori');
      catSheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Nama', key: 'name', width: 22 },
        { header: 'Tipe', key: 'type', width: 14 },
        { header: 'Warna', key: 'color', width: 12 },
      ];

      const catHeader = catSheet.getRow(1);
      catHeader.font = headerFont;
      catHeader.fill = headerFill;

      for (const [i, c] of categories.entries()) {
        catSheet.addRow({
          no: i + 1,
          name: c.name,
          type: c.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
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
