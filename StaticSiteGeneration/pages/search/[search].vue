<script setup>
import { navigateTo } from 'nuxt/app';

const route = useRoute();
const searchQuery = route.params.search || '';

navigateTo(`/?search=${searchQuery}`);
</script>
