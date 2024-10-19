export const useAppStore = defineStore('app', () => {
  const currentSection = ref('serverActivity');
  function setCurrentSection(section: string) {
    currentSection.value = section;
  }
  return {
    currentSection,
    setCurrentSection
  };
});
