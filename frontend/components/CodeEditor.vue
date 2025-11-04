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
  <div ref="editorRef" style="height: 100%" />
</template>
