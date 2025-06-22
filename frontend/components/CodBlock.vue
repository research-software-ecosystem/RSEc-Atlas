<script setup lang="ts">
interface Props {
  code: string;
}

const props = defineProps<Props>();

const toast = useToast();

function copyToClipboard() {
  navigator.clipboard
    .writeText(props.code)
    .then(() => {
      toast.add({
        title: "Code copied to clipboard!",
        color: "success",
        icon: "uil:check-circle",
      });
    })
    .catch(() => {
      toast.add({
        title: "Failed to copy code",
        color: "error",
        icon: "uil:exclamation-triangle",
      });
    });
}
</script>

<template>
  <div
    class="bg-black-800 mb-4 flex justify-between gap-2 rounded-lg border p-2"
  >
    <code class="break-all">
      <slot>> {{ props.code }}</slot>
    </code>

    <UTooltip :delay-duration="0" text="Copy to clipboard">
      <UButton
        class="h-fit cursor-pointer rounded bg-gray-700 px-2 py-1 text-white hover:bg-gray-600"
        title="Copy to clipboard"
        leading-icon="uil:copy"
        @click="copyToClipboard"
      />
    </UTooltip>
  </div>
</template>
