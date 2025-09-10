
import * as React from "react"
import * as Select from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../../lib/utils"

interface BrandDropdownProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

interface BrandDropdownItemProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const BrandDropdown = React.forwardRef<
  React.ElementRef<typeof Select.Trigger>,
  BrandDropdownProps
>(({ className, placeholder, children, ...props }, ref) => (
  <Select.Root {...props}>
    <Select.Trigger
      ref={ref}
      className={cn(
        "flex h-12 sm:h-14 w-full items-center justify-between rounded-xl border-2 border-[#6667AB]/30 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm text-[#6667AB] transition-colors focus:border-[#6667AB] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <Select.Value placeholder={placeholder} />
      <Select.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="relative z-50 max-h-80 sm:max-h-96 min-w-[12rem] sm:min-w-[16rem] overflow-hidden rounded-xl border-2 border-[#6667AB] bg-white shadow-lg animate-in fade-in-0 zoom-in-95">
        <Select.ScrollUpButton className="flex cursor-default items-center justify-center h-6 bg-white text-[#6667AB]">
          <ChevronUp className="h-4 w-4" />
        </Select.ScrollUpButton>
        <Select.Viewport className="p-1 sm:p-2">
          {children}
        </Select.Viewport>
        <Select.ScrollDownButton className="flex cursor-default items-center justify-center h-6 bg-white text-[#6667AB]">
          <ChevronDown className="h-4 w-4" />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
))
BrandDropdown.displayName = "BrandDropdown"

const BrandDropdownItem = React.forwardRef<
  React.ElementRef<typeof Select.Item>,
  BrandDropdownItemProps
>(({ className, children, ...props }, ref) => (
  <Select.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm text-[#6667AB] outline-none transition-colors hover:bg-[#6667AB] hover:text-white focus:bg-[#6667AB] focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 sm:right-3 flex h-3.5 w-3.5 items-center justify-center">
      <Select.ItemIndicator>
        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
      </Select.ItemIndicator>
    </span>
    <Select.ItemText>{children}</Select.ItemText>
  </Select.Item>
))
BrandDropdownItem.displayName = "BrandDropdownItem"

const BrandDropdownSeparator = React.forwardRef<
  React.ElementRef<typeof Select.Separator>,
  React.ComponentPropsWithoutRef<typeof Select.Separator>
>(({ className, ...props }, ref) => (
  <Select.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-[#6667AB]/20", className)}
    {...props}
  />
))
BrandDropdownSeparator.displayName = "BrandDropdownSeparator"

export { BrandDropdown, BrandDropdownItem, BrandDropdownSeparator }
