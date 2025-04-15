export function EditPencilIcon({ color = '#FFCB05' }: { color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill={color}
        fillRule="nonzero"
        d="M16.05 11.343l1.529-1.528-3.483-3.418-1.518 1.474 3.472 3.472zm-.707.707l-3.482-3.482L5 15.231v3.566l3.587.01 6.756-6.757zM19 9.808l-10 10-5-.013v-4.987L14.1 5 19 9.808zM8.642 15.24l3.857-3.804-.702-.712-3.858 3.804.703.712z"
      />
    </svg>
  );
}
