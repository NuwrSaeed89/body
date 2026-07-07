"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";

const labelClassName =
  "text-[10px] font-semibold uppercase tracking-widest text-secondary";

const inputClassName =
  "w-full border-none bg-transparent px-0 py-3 text-base text-primary placeholder:text-outline-variant/60 outline-none focus:outline-none focus-visible:outline-none focus:ring-0";

type AuthUnderlineFieldProps = {
  id: string;
  name?: string;
  label: string;
  type?: string;
  placeholder?: string;
  labelExtra?: ReactNode;
  required?: boolean;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  /** Blocks browser autofill until the user focuses the field. */
  suppressInitialAutofill?: boolean;
};

export function AuthUnderlineField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  labelExtra,
  required,
  value,
  onChange,
  autoComplete,
  suppressInitialAutofill = false,
}: AuthUnderlineFieldProps) {
  const t = useTranslations("account.login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [autofillUnlocked, setAutofillUnlocked] = useState(!suppressInitialAutofill);
  const isPassword = type === "password";
  const inputType = isPassword ? (passwordVisible ? "text" : "password") : type;
  const resolvedAutoComplete =
    suppressInitialAutofill && !autofillUnlocked
      ? "off"
      : autoComplete ?? (isPassword ? "current-password" : "email");

  const unlockAutofill = () => {
    if (suppressInitialAutofill && !autofillUnlocked) {
      setAutofillUnlocked(true);
    }
  };

  return (
    <div className="input-underline border-b border-outline-variant/50">
      {labelExtra ? (
        <div className="flex items-end justify-between">
          <label htmlFor={id} className={labelClassName}>
            {label}
          </label>
          {labelExtra}
        </div>
      ) : (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={id}
          name={name ?? id}
          type={inputType}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          autoComplete={resolvedAutoComplete}
          readOnly={suppressInitialAutofill && !autofillUnlocked}
          onFocus={unlockAutofill}
          className={`${inputClassName} ${isPassword ? "pr-10" : ""}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((current) => !current)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-secondary transition-colors hover:text-primary"
            aria-label={passwordVisible ? t("hidePassword") : t("showPassword")}
            aria-pressed={passwordVisible}
          >
            <span className="material-symbols-outlined text-xl leading-none">
              {passwordVisible ? "visibility_off" : "visibility"}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
