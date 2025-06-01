import React from "react";
export function Button({ children, onClick, className, variant }) {
  const base = "px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700";
  const destructive = "bg-red-600 hover:bg-red-700";
  const style = variant === "destructive" ? destructive : base;
  return (
    <button onClick={onClick} className={`${style} ${className || ""}`}>
      {children}
    </button>
  );
}