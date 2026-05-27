import { createWorker } from 'tesseract.js';

export interface ReceiptData {
  total: number | null;
  date: string | null;
  description: string;
}

const cleanAmount = (val: string): number | null => {
  const cleaned = val
    .replace(/[^0-9,.\s]/g, '')
    .replace(/\s/g, '')
    .trim();
  if (!cleaned) {
    return null;
  }

  const hasDot = cleaned.includes('.');
  const hasComma = cleaned.includes(',');

  // Format Indonesia: dot = thousand separator, comma = decimal
  // e.g. "50.000" = 50000, "50.000,50" = 50000.5
  if (hasComma) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.'));
  }
  if (hasDot) {
    const parts = cleaned.split('.');
    const lastLen = parts[parts.length - 1].length;
    // Jika bagian terakhir 3 digit, dot = pemisah ribuan (50.000 → 50000)
    if (lastLen === 3 && parts.length > 1) {
      return Number(parts.join(''));
    }
    // Jika ≤2 digit, dot = desimal (50.00 → 50)
    return Number(cleaned);
  }
  return Number(cleaned);
};

const datePatterns = [
  /(\d{2})\s*(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)[a-z]*\s*(\d{4})/i,
  /(\d{2})[/.-](\d{2})[/.-](\d{4})/,
  /(\d{4})[/.-](\d{2})[/.-](\d{2})/,
  /(\d{2})\s+(\d{2})\s+(\d{4})/,
];

const monthMap: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  mei: '05',
  jun: '06',
  jul: '07',
  agu: '08',
  sep: '09',
  okt: '10',
  nov: '11',
  des: '12',
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
};

const parseDate = (text: string): string | null => {
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (!match) {
      continue;
    }

    if (match[2] && isNaN(Number(match[2]))) {
      const month = monthMap[match[2].toLowerCase().slice(0, 3)];
      if (month) {
        const day = match[1].padStart(2, '0');
        return `${match[3]}-${month}-${day}`;
      }
    } else if (match[1] && match[2] && match[3]) {
      let y = match[3];
      const m = match[2].padStart(2, '0');
      const d = match[1].padStart(2, '0');
      if (y.length === 2) {
        y = '20' + y;
      }
      if (Number(m) >= 1 && Number(m) <= 12) {
        return `${y}-${m}-${d}`;
      }
      if (Number(d) >= 1 && Number(d) <= 12 && Number(m) > 12) {
        return `${y}-${d}-${m}`;
      }
    }
  }
  return null;
};

const totalKeywords = [
  'total',
  'jumlah',
  'bayar',
  'amount',
  'subtotal',
  'grand total',
  'rp',
  'total bayar',
  'total belanja',
  'total pembayaran',
];

const parseAmount = (text: string): number | null => {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  for (const kw of totalKeywords) {
    for (const line of lines) {
      if (line.toLowerCase().includes(kw)) {
        const val = cleanAmount(line);
        if (val && val > 0) {
          return val;
        }
      }
    }
  }

  const amounts = lines.map((l) => cleanAmount(l)).filter((v): v is number => v !== null && v > 0);
  return amounts.length > 0 ? amounts[amounts.length - 1] : null;
};

const storeNames = [
  'indomaret',
  'alfamart',
  'alfamidi',
  'superindo',
  'hypermart',
  'transmart',
  'giant',
  'hero',
  'ranch market',
  'diamond',
  'miniso',
  'mr diy',
  'ace hardware',
  'informa',
];

const parseStoreName = (lines: string[]): string => {
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    for (const name of storeNames) {
      if (lower.includes(name)) {
        return line.trim();
      }
    }
  }
  return '';
};

export const useOcr = () => {
  const progress = ref(0);
  const status = ref('');
  const loading = ref(false);

  const scanReceipt = async (file: File): Promise<ReceiptData | null> => {
    loading.value = true;
    progress.value = 0;
    status.value = 'Initializing OCR...';

    try {
      const worker = await createWorker('ind+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            progress.value = Math.round(m.progress * 100);
          }
          status.value = m.status;
        },
      });

      status.value = 'Reading receipt...';
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const text = data.text;
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

      const total = parseAmount(text);
      const date = parseDate(text);
      const storeName = parseStoreName(lines);
      const descLines = lines
        .filter((l) => {
          const lower = l.toLowerCase();
          return !lower.includes('total') && !lower.includes('rp')
            && !lower.includes('tanggal') && !lower.includes('date')
            && !/^\d+$/.test(l.trim());
        })
        .slice(0, 3);
      const description = storeName
        ? `${storeName} — ${descLines[0] || 'receipt'}`
        : (descLines[0] || 'Receipt scan');

      console.log('[OCR] Raw text:', text);
      console.log('[OCR] Lines:', lines);
      console.log('[OCR] Parsed:', { total, date, storeName, description });

      loading.value = false;
      progress.value = 100;
      status.value = 'Done';

      return { total, date, description };
    } catch (_e) {
      loading.value = false;
      status.value = 'Error';
      return null;
    }
  };

  return { scanReceipt, progress, status, loading };
};
