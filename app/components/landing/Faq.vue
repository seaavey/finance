<template>
  <section class="relative px-6 py-16 md:py-24">
    <div class="mx-auto max-w-2xl">
      <div class="text-center">
        <p class="text-sm font-medium text-primary mb-3">FAQ</p>
        <h2 class="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {{ $t('landing.faq_title') }}
        </h2>
      </div>

      <div class="mt-10 space-y-3">
        <div
          v-for="item in faqItems"
          :key="item.value"
          class="group rounded-xl border border-border/40 bg-background/40 transition-all duration-300 hover:border-primary/20 hover:bg-background/60"
        >
          <Accordion type="single" collapsible class="w-full">
            <AccordionItem :value="item.value" class="border-0">
              <AccordionTrigger class="px-5 py-4 text-sm font-medium hover:no-underline">
                {{ item.question }}
              </AccordionTrigger>
              <AccordionContent class="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                {{ item.answer }}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const faqItems = [
  {
    value: 'free',
    question: 'Apakah aplikasi ini gratis?',
    answer: 'Ya, Finance gratis digunakan selamanya. Tidak ada biaya berlangganan tersembunyi.',
  },
  {
    value: 'couple',
    question: 'Bisa dipakai bareng pasangan?',
    answer:
      'Tentu! Kamu bisa menghubungkan akun dengan pasangan untuk saling lihat transaksi dan kelola keuangan bersama.',
  },
  {
    value: 'security',
    question: 'Data saya aman?',
    answer:
      'Data kamu terenkripsi dan aman. Kami menggunakan Supabase sebagai backend yang sudah terpercaya dengan RLS di setiap tabel.',
  },
  {
    value: 'mobile',
    question: 'Bisa diakses dari HP?',
    answer:
      'Bisa. Finance adalah web app responsif yang bisa diakses dari browser HP mana pun — tanpa perlu install.',
  },
  {
    value: 'export',
    question: 'Bisa export data ke Excel?',
    answer:
      'Bisa. Kamu bisa download laporan transaksi bulanan dalam format CSV untuk analisis mandiri.',
  },
];
</script>