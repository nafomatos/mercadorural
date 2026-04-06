import { CITY_GROUPS } from "@/lib/cities";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

export default function CitySelect({
  id,
  value,
  onChange,
  className = "",
  placeholder = "Selecione a cidade...",
  disabled,
}: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {CITY_GROUPS.map((group) => (
        <optgroup key={group.state} label={group.state}>
          {group.cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
