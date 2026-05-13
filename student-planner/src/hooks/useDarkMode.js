import useSettingsStore from '../store/settingsStore'

export const useDarkMode = () => {
  const darkMode = useSettingsStore(s => s.darkMode)
  const toggleDarkMode = useSettingsStore(s => s.toggleDarkMode)
  return { darkMode, toggleDarkMode }
}
