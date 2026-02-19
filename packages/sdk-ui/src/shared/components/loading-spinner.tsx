import LoadingIcon from '@/shared/icons/loading-icon';

/**
 * Centered, animated spinner.
 */
export default function LoadingSpinner() {
  return (
    <div className="csdk-m-auto" aria-label="loading spinner">
      <LoadingIcon spin />
    </div>
  );
}
