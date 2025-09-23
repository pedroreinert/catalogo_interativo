import React, { memo, forwardRef, useId } from 'react'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'

const StableInput = memo(forwardRef(({ 
  id, 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  className = "", 
  required = false,
  min,
  max,
  ...props 
}, ref) => {
  const uniqueId = useId()
  const finalId = id || uniqueId

  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <div>
      <Label htmlFor={finalId} className="text-lg">
        {label} {required && "*"}
      </Label>
      <Input
        id={finalId}
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`mt-2 h-12 text-lg ${className}`}
        min={min}
        max={max}
        {...props}
      />
    </div>
  )
}))

StableInput.displayName = 'StableInput'

export default StableInput 