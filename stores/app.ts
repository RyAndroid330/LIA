import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const currentSection = ref('serverActivity');
  const isDarkMode = ref(localStorage.getItem('darkMode') === 'true' || false);
  const userName = ref('');
  const password = ref('');
  const isLoggedIn = ref(false);

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

  function setUserName(name: string) {
    userName.value = name;
  }

  function setPassword(pass: string) {
    password.value = pass;
  }

  function setLoggedIn(status: boolean) {
    isLoggedIn.value = status;
  }

  return {
    currentSection,
    setCurrentSection,
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    userName,
    password,
    isLoggedIn,
    setUserName,
    setPassword,
    setLoggedIn
  };
});
