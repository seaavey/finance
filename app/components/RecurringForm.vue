<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ item ? 'Edit Transaksi Rutin' : 'Tambah Transaksi Rutin' }}</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label>Tipe</Label>
          <div class="flex gap-2">
            <Button type="button" :variant="form.type === 'income' ? 'default' : 'outline'" class="flex-1" @click="form.type = 'income'">
              Pemasukan
            </Button>
            <Button type="button" :variant="form.type === 'expense' ? 'default' : 'outline'" class="flex-1" @click="form.type = 'expense'">
              Pengeluaran
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="r-amount">Jumlah</Label>
          <Input id="r-amount" v-model.number="form.amount" type="number" min="1" step="any" placeholder="0" required />
        </div>

        <div class="space-y-2">
          <Label>Mata Uang</Label>
          <Select v-model="form.currency">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in currencies" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Kategori</Label>
          <CategoryPicker v-model="form.category_id" :type="form.type" placeholder="Pilih kategori" />
        </div>

        <div class="space-y-2">
          <Label for="r-desc">Deskripsi</Label>
          <Input id="r-desc" v-model="form.description" placeholder="Catatan (opsional)" />
        </div>

        <div class="space-y-2">
          <Label>Frekuensi</Label>
          <Select v-model="form.frequency">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="r-next">Tanggal Berikutnya</Label>
          <Input id="r-next" v-model="form.next_date" type="date" required />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="$emit('close')">Batal</Button>
          <Button type="submit" :disabled="!form.amount || !form.next_date">Simpan</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { RecurringTransaction } from '~/composables/useRecurring';

const props = defineProps<{
  item?: RecurringTransaction;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const { currencies, defaultCurrency } = useCurrency();
const { addRecurring, updateRecurring } = useRecurring();

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  type: props.item?.type ?? ('expense' as 'income' | 'expense'),
  amount: props.item?.amount ?? ('' as unknown as number),
  currency: props.item?.currency ?? defaultCurrency.value,
  category_id: props.item?.category_id ?? '',
  description: props.item?.description ?? '',
  frequency: props.item?.frequency ?? ('monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly'),
  next_date: props.item?.next_date ?? today,
});

const onSubmit = async () => {
  const payload: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'> = {
    type: form.type,
    amount: Number(form.amount),
    currency: form.currency,
    category_id: form.category_id || null,
    description: form.description || null,
    frequency: form.frequency,
    next_date: form.next_date!,
    active: true,
  };

  if (props.item) {
    await updateRecurring(props.item.id, payload);
  } else {
    await addRecurring(payload);
  }
  emit('saved');
};
</script>
