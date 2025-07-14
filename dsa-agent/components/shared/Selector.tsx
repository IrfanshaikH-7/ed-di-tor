import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface Option {
  label: string;
  value: string;
}

interface SelectorProps {
  options: Option[];
  value?: string;
  placeholder?: string;
  label?: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'default' | 'sm' | 'xs';
}

export default function Selector({
  options,
  value,
  placeholder = "Select an option",
  label,
  onChange,
  className = "w-[180px]",
  size='default'
}: SelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size={size || 'default'} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-neutral-800 border-neutral-700">
        <SelectGroup>
          {label && <SelectLabel>{label}</SelectLabel>}
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}
             className="focus:bg-neutral-700 focus:text-neutral-300 text-neutral-300"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
