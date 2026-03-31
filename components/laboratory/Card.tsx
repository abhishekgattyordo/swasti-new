// interface CardProps {
//   children: React.ReactNode;
//   className?: string;
//   onClick?: () => void;
// }

// export default function Card({ children, className = "", onClick }: CardProps) {
//   return (
//     <div
//       className={`
//         bg-white rounded-xl border border-gray-200 
//         shadow-sm transition-all duration-200
//         ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
//         ${className}
//       `}
//       onClick={onClick}
//     >
//       {children}
//     </div>
//   );
// }

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 
        shadow-sm transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}