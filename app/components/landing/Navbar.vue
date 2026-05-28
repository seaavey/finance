<template>
  <header
    class="sticky top-0 z-50 w-full transition-all duration-500"
    :class="[
      isScrolled
        ? 'border-b border-border/40 bg-background/80 backdrop-blur-xl py-2'
        : 'bg-transparent py-4',
    ]"
  >
    <div class="mx-auto flex h-12 max-w-7xl items-center justify-between px-6 relative">
      <!-- Logo -->
      <div class="flex flex-1 justify-start">
        <NuxtLinkLocale to="/" class="group flex items-center gap-2 transition-all duration-300">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm"
          >
            <Icon name="hugeicons:wallet-01" :size="20" />
          </div>
          <span
            class="text-xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-500"
          >
            {{ $t('sidebar.finance') }}
          </span>
        </NuxtLinkLocale>
      </div>

      <!-- Center Navigation (Desktop) - Sliding Pill Animation -->
      <nav
        class="hidden md:flex items-center p-1 bg-muted/50 rounded-full border border-border/20 absolute left-1/2 -translate-x-1/2 backdrop-blur-sm"
      >
        <div class="relative flex items-center">
          <!-- Sliding Background -->
          <div
            class="absolute h-full transition-all duration-300 ease-out bg-primary rounded-full shadow-md shadow-primary/20"
            :style="pillStyle"
          />

          <Button
            v-for="(item, index) in navItems"
            :key="item.href"
            ref="navRefs"
            variant="ghost"
            class="relative z-10 px-5 py-1.5 text-sm font-medium whitespace-nowrap rounded-full"
            :class="[
              activeSection === item.href.replace('#', '')
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="scrollToSection(item.href)"
          >
            {{ $t(item.label) }}
          </Button>
        </div>
      </nav>

      <!-- Right Actions -->
      <div class="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        <!-- Utilitas Group (Desktop) -->
        <div class="hidden sm:flex items-center p-1 bg-muted/30 rounded-lg border border-border/10">
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 rounded-md hover:bg-background shadow-none transition-transform active:scale-95"
            @click="toggleColorMode"
          >
            <ClientOnly>
              <Icon
                :name="colorMode.value === 'dark' ? 'hugeicons:sun-01' : 'hugeicons:moon-01'"
                :size="18"
              />
              <template #fallback>
                <div class="size-4.5 rounded-full border border-border/40 animate-pulse" />
              </template>
            </ClientOnly>
          </Button>

          <div class="w-px h-4 bg-border/30 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-md hover:bg-background shadow-none transition-transform active:scale-95"
              >
                <Icon name="hugeicons:language-skill" :size="18" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-32">
              <DropdownMenuItem
                v-for="locale in availableLocales"
                :key="locale.code"
                class="cursor-pointer"
                @click="setLocale(locale.code)"
              >
                <span :class="{ 'font-bold text-primary': currentLocale === locale.code }">
                  {{ locale.name }}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Auth Buttons (Desktop) -->
        <div class="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            class="font-medium hover:bg-primary/5 transition-colors"
            @click="goToLogin"
          >
            {{ $t('auth.login_title') }}
          </Button>
          <Button
            size="sm"
            class="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            @click="goToLogin"
          >
            {{ $t('auth.register') }}
          </Button>
        </div>

        <!-- Mobile Menu Trigger -->
        <Sheet>
          <SheetTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="md:hidden h-10 w-10 rounded-xl hover:bg-muted transition-colors"
            >
              <Icon name="hugeicons:menu-01" :size="24" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-75 sm:w-100 flex flex-col">
            <SheetHeader class="text-left pb-6 border-b">
              <SheetTitle class="text-xl font-bold flex items-center gap-2">
                <div
                  class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground"
                >
                  <Icon name="hugeicons:wallet-01" :size="18" />
                </div>
                {{ $t('sidebar.finance') }}
              </SheetTitle>
            </SheetHeader>

            <div class="flex-1 py-8 flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <p
                  class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2"
                >
                  {{ $t('landing.navigation') }}
                </p>
                <SheetClose v-for="item in navItems" :key="item.href" as-child>
                  <Button
                    variant="ghost"
                    class="w-full justify-start"
                    @click="scrollToSection(item.href)"
                  >
                    {{ $t(item.label) }}
                    <Icon
                      name="hugeicons:arrow-right-01"
                      :size="18"
                      class="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                    />
                  </Button>
                </SheetClose>
              </div>

              <div class="flex flex-col gap-2">
                <p
                  class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2"
                >
                  {{ $t('settings.preferences') }}
                </p>
                <div class="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50">
                  <span class="text-sm font-medium">{{ $t('settings.theme') }}</span>
                  <Switch :checked="colorMode.value === 'dark'" @update:checked="toggleColorMode" />
                </div>
                <div class="flex flex-col gap-1 px-2 mt-2">
                  <p class="text-xs font-medium text-muted-foreground mb-1">
                    {{ $t('settings.language') }}
                  </p>
                  <div class="flex gap-2">
                    <Button
                      v-for="locale in locales"
                      :key="locale.code"
                      variant="outline"
                      size="sm"
                      class="flex-1 rounded-lg"
                      :class="{
                        'border-primary bg-primary/5 text-primary': currentLocale === locale.code,
                      }"
                      @click="setLocale(locale.code)"
                    >
                      {{ locale.name }}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t flex flex-col gap-3">
              <Button
                class="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
                @click="goToLogin"
              >
                {{ $t('auth.register') }}
              </Button>
              <Button
                variant="ghost"
                class="w-full h-12 rounded-xl text-base font-medium"
                @click="goToLogin"
              >
                {{ $t('auth.login_title') }}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useRouter } from '#imports';
import { useWindowScroll } from '@vueuse/core';

const { t, locale: currentLocale, locales, setLocale } = useI18n();
const localePath = useLocalePath();
const router = useRouter();
const colorMode = useColorMode();
const { y } = useWindowScroll();

const isScrolled = computed(() => y.value > 20);
const activeSection = ref('');
const navRefs = ref<HTMLElement[]>([]);

// Clear active section when at the top, and handle bottom of page for FAQ
watch(y, (newY) => {
  if (newY < 200) {
    activeSection.value = '';
    return;
  }

  // Detect if we are at the bottom of the page
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;
  if (newY + clientHeight >= scrollHeight - 100) {
    activeSection.value = 'faq';
  }
});

const navItems = [
  { label: 'landing.nav_features', href: '#features' },
  { label: 'landing.nav_testimonials', href: '#testimonials' },
  { label: 'landing.nav_faq', href: '#faq' },
];

const availableLocales = computed(() => {
  return (locales.value as { code: typeof currentLocale.value; name: string }[]).filter(
    (l) => l.code !== currentLocale.value,
  );
});

const pillStyle = computed(() => {
  const activeIndex = navItems.findIndex(
    (item) => item.href.replace('#', '') === activeSection.value,
  );
  if (activeIndex === -1 || !navRefs.value[activeIndex]) {
    return { width: '0px', left: '0px', opacity: 0 };
  }

  const el = navRefs.value[activeIndex];
  return {
    width: `${el.offsetWidth}px`,
    left: `${el.offsetLeft}px`,
    opacity: 1,
  };
});

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

const scrollToSection = (href: string) => {
  const id = href.replace('#', '');
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

const goToLogin = () => router.push(localePath('/auth/login'));

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '-10% 0px -40% 0px',
    },
  );

  navItems.forEach((item) => {
    const el = document.getElementById(item.href.replace('#', ''));
    if (el) {
      observer.observe(el);
    }
  });
});
</script>
