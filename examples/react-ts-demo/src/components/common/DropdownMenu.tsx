export const DropdownMenu = ({
  label,
  options,
  onChange,
}: {
  label: string;
  options: { value: string; text: string }[];
  onChange: (value: string) => void;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          marginLeft: '10px',
          paddingTop: '5px',
          paddingRight: '10px',
        }}
      >
        {`${label}:`}
      </div>

      <select
        style={{
          width: '180px',
          height: '30px',
          border: '1px solid #999',
          fontSize: '14px',
          color: 'black',
          backgroundColor: '#eee',
          borderRadius: '5px',
        }}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      >
        {options.map((option) => {
          return (
            <option
              key={`${option.value}`}
              value={`${option.value}`}
            >{`${option.text}`}</option>
          );
        })}
      </select>
    </div>
  );
};
