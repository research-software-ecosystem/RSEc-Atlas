<script setup lang="ts">
import type Editor from "~/components/CodeEditor.vue";

interface Props {
  tool: Tool;
}

const props = defineProps<Props>();

const toast = useToast();

const toolSourceCode = computed(() => {
  return JSON.stringify(props.tool, null, 2);
});

async function copyToClipboard() {
  if (import.meta.client && window.navigator?.clipboard) {
    await window.navigator.clipboard.writeText(toolSourceCode.value);

    toast.add({ title: "Content copied!", icon: "uil:copy" });
  }
}

function downloadJson() {
  if (import.meta.client) {
    const blob = new Blob([JSON.stringify(props.tool, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.tool.tool_name}-source.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.add({ title: "Download started!", icon: "uil:download-alt" });
  }
}

const editorInstance = ref<InstanceType<typeof Editor> | null>(null);
</script>

<template>
  <div class="h-full overflow-hidden rounded-lg border">
    <div class="border-b bg-gray-50 px-4 py-2 dark:bg-gray-800">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Source Data (JSON)
          <UBadge
            size="sm"
            variant="subtle"
            class="text-gray-600 dark:text-gray-300"
          >
            Read Only
          </UBadge>
        </span>

        <div class="flex items-center gap-2">
          <UButton
            size="sm"
            color="primary"
            icon="uil:download-alt"
            @click="downloadJson"
          >
            Download JSON
          </UButton>

          <UButton
            size="sm"
            variant="outline"
            icon="uil:copy"
            @click="copyToClipboard"
          >
            Copy
          </UButton>
        </div>
      </div>
    </div>

    <div class="h-full rounded-lg bg-white dark:bg-gray-900">
      <CodeEditor ref="editorInstance" :value="toolSourceCode" />

      <div v-if="editorInstance?.hasError" class="p-4">
        <p class="mb-2 text-sm text-gray-600">
          The editor failed to load. Here's the raw data:
        </p>

        <pre
          class="max-h-32 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800"
        >
        {{ toolSourceCode }}
        </pre>
      </div>
    </div>
  </div>
</template>
