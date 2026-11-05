<script setup>
import { navigateTo } from 'nuxt/app';

const route = useRoute();
const searchQuery = String(route.params.search || '');

// replace: keep /search/x out of history so Back does not bounce to the redirect again
navigateTo(getSearchRedirect(searchQuery), { replace: true });
</script>
