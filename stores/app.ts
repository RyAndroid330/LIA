import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const currentSection = ref('serverActivity');
  const isDarkMode = ref(localStorage.getItem('darkMode') === 'true' || false);
  const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true');
  const userName = ref(localStorage.getItem('userName'));
  const password = ref(localStorage.getItem('password'));

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

  function setLoggedIn(value: boolean) {
    isLoggedIn.value = value;
    localStorage.setItem('isLoggedIn', value.toString());
  }

  function setUserName(name: string) {
    userName.value = name;
    localStorage.setItem('userName', name);
  }

  function setPassword(pass: string) {
    password.value = pass;
    localStorage.setItem('password', pass);
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
    setLoggedIn,
    setUserName,
    setPassword
  };
});
