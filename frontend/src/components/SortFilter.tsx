import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import type { SortFilterProps, SortType } from "@/types";
import { sortOptions } from "@/lib/data";

const SortFilter = ({ sortBy, setSortBy }: SortFilterProps) => {
  const [open, setOpen] = useState(false);

  const currentSort = sortOptions.find(option => option.value === sortBy);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          role="combobox"
          aria-expanded={open}
          className="w-[115px] justify-between"
        >
          {currentSort ? currentSort.label : "Sắp xếp theo..."}
          <ArrowUpDown className="ml-0.5 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[120px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {sortOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setSortBy(currentValue as SortType);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SortFilter;