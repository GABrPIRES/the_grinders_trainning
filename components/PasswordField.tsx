'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Input de senha com botão integrado para mostrar/esconder o valor digitado.
 *
 * Aceita todas as props nativas de <input> exceto `type` (sempre password/text
 * controlado pelo toggle interno).
 *
 * O `className` passado é aplicado ao <input> — adicionamos `pr-12` no início
 * para reservar espaço do botão. Pais que precisem da ref do input podem usar
 * `forwardRef`.
 */
const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField(
  { className = '', ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`pr-12 ${className}`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-content-muted hover:text-content-secondary transition-colors"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});

export default PasswordField;
