import React, { forwardRef } from 'react'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'

const FormField = forwardRef(({ 
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
  return (
    <div>
      <Label htmlFor={id} className="text-lg">
        {label} {required && "*"}
      </Label>
      <Input
        id={id}
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`mt-2 h-12 text-lg ${className}`}
        min={min}
        max={max}
        {...props}
      />
    </div>
  )
})

FormField.displayName = 'FormField'

export default FormField 