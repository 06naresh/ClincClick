import { forwardRef } from "react";

const Card = forwardRef(function CardComponent({ children, className = "", ...props }, ref) {
  return (
    <div ref={ref} {...props} className={`rounded-xl border border-stroke bg-surface p-5 shadow-sm ${className}`}>
      {children}
    </div>
  )
})

export default Card