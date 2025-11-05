<script setup lang="ts">
interface Props {
  value: string;
  language?: string;
}

const props = withDefaults(defineProps<Props>(), {
  language: "json",
});

const editorRef = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);
const hasError = ref(false);
let editor: import("monaco-editor").editor.IStandaloneCodeEditor | null = null;

const colorMode = useColorMode();

const skeletonLines = Array.from(
  { length: Math.floor(Math.random() * 11) + 20 },
  () => {
    const widths = [
      "w-1/2",
      "w-2/3",
      "w-3/4",
      "w-4/5",
      "w-5/6",
      "w-11/12",
      "w-full",
    ];
    return widths[Math.floor(Math.random() * widths.length)];
  },
);

onMounted(async () => {
  if (import.meta.client && editorRef.value) {
    try {
      isLoading.value = true;
      console.log("Loading Monaco Editor...");

      const monaco = await import("monaco-editor");

      console.log("Monaco Editor imported successfully");

      editor = monaco.editor.create(editorRef.value, {
        value: props.value,
        language: props.language,
        theme: colorMode.value === "dark" ? "vs-dark" : "vs-light",
        readOnly: true,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        fontSize: 14,
        lineNumbers: "on",
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
        },
      });

      console.log("Monaco Editor instance created");
    } catch (error) {
      console.error("Error loading Monaco Editor:", error);
      hasError.value = true;
    } finally {
      isLoading.value = false;
    }
  }
});

watch(
  () => props.value,
  (newValue) => {
    if (editor && newValue !== editor.getValue()) {
      editor.setValue(newValue);
    }
  },
);

watch(
  () => colorMode.value,
  (newMode) => {
    if (editor) {
      editor.updateOptions({
        theme: newMode === "dark" ? "vs-dark" : "vs-light",
      });
    }
  },
);

defineExpose({
  hasError,
});

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
    editor = null;
  }
});
</script>

<template>
  <div class="relative h-full">
    <div v-if="isLoading" class="absolute inset-0 overflow-hidden p-2">
      <div class="space-y-3">
        <div
          v-for="(width, index) in skeletonLines"
          :key="index"
          class="flex gap-2"
        >
          <USkeleton class="h-4 w-8" />
          <USkeleton class="h-4" :class="width" />
        </div>
      </div>
    </div>

    <div ref="editorRef" style="height: 100%" />
  </div>
</template>
