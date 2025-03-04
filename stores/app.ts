import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const currentSection = ref('serverActivity');
  const isDarkMode = ref(localStorage.getItem('darkMode') === 'true' || false);

  function setCurrentSection(section: string) {
    currentSection.value = section;
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('darkMode', isDarkMode.value.toString());
  }

  function setDarkMode(value: boolean) {
    isDarkMode.value = value;
    localStorage.setItem('darkMode', value.toString());
  }

  return {
    currentSection,
    setCurrentSection,
    isDarkMode,
    toggleDarkMode,
    setDarkMode
  };
});
