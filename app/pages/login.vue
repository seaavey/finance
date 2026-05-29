<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo(useLocalePath()('/auth/login'), { redirectCode: 301 });
    },
  ],
});
</script>
