<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo(useLocalePath()('/auth/login'), { redirectCode: 301 });
    },
  ],
});
</script>
