import { useThemeContext } from '@/infra/contexts/theme-provider';

export default function ScrollToBottomIcon() {
  const { themeSettings } = useThemeContext();
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.1747 9.1203L12 11.8401L8.82529 9.1203C8.61558 8.94064 8.29994 8.965 8.12028 9.17471C7.94062 9.38442 7.96498 9.70006 8.17469 9.87972L11.6747 12.8782C11.8619 13.0385 12.1381 13.0385 12.3253 12.8782L15.8253 9.87972C16.035 9.70006 16.0594 9.38442 15.8797 9.17471C15.7 8.965 15.3844 8.94064 15.1747 9.1203ZM15.8797 12.1731C15.7 11.9634 15.3844 11.9391 15.1747 12.1187L12 14.8385L8.82529 12.1187C8.61558 11.9391 8.29994 11.9634 8.12028 12.1731C7.94062 12.3829 7.96498 12.6985 8.17469 12.8782L11.6747 15.8766C11.8619 16.037 12.1381 16.037 12.3253 15.8766L15.8253 12.8782C16.035 12.6985 16.0594 12.3829 15.8797 12.1731Z"
        fill={themeSettings.aiChat.primaryTextColor}
      />
    </svg>
  );
}
