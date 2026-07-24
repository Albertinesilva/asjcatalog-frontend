import Swal, { type SweetAlertOptions, type SweetAlertResult } from "sweetalert2";
import i18n from "@/i18n/config";

/**
 * Wrapper centralizado de SweetAlert2.
 * Nenhuma página deve importar `sweetalert2` diretamente —
 * sempre utilize os helpers deste arquivo.
 *
 * Estratégia (RC2.1):
 * - Utiliza SOMENTE a Promise oficial retornada por `Swal.fire()`,
 *   que já representa a interação do usuário (confirm / cancel / dismiss).
 * - NÃO envolvemos `Swal.fire` em uma Promise paralela dependente de
 *   `didClose` — esse callback pode nunca disparar quando ocorre troca
 *   de rota / desmontagem de componentes durante a animação de saída,
 *   travando `await` e impedindo `navigate()`.
 * - `heightAuto: false` evita scroll-lock residual no <body> após navegação.
 */

const baseTheme = {
  confirmButtonColor: "#2986CC",
  cancelButtonColor: "#9E9E9E",
};

/** Traduz sempre no idioma ativo (fora do ciclo React). */
const tr = (key: string, fallback: string): string =>
  (i18n.t(key, { defaultValue: fallback }) as string) ?? fallback;

function fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
  return Swal.fire({
    heightAuto: false,
    ...options,
  });
}

export const alerts = {
  success(title: string, text?: string): Promise<SweetAlertResult> {
    return fire({
      icon: "success",
      title,
      text,
      ...baseTheme,
      confirmButtonText: tr("common:actions.ok", "OK"),
    });
  },

  error(title: string, text?: string): Promise<SweetAlertResult> {
    return fire({
      icon: "error",
      title,
      text,
      ...baseTheme,
      confirmButtonText: tr("common:actions.ok", "OK"),
    });
  },

  warning(title: string, text?: string): Promise<SweetAlertResult> {
    return fire({
      icon: "warning",
      title,
      text,
      ...baseTheme,
      confirmButtonText: tr("common:actions.ok", "OK"),
    });
  },

  info(title: string, text?: string): Promise<SweetAlertResult> {
    return fire({
      icon: "info",
      title,
      text,
      ...baseTheme,
      confirmButtonText: tr("common:actions.ok", "OK"),
    });
  },

  confirm(
    title: string,
    text?: string,
    confirmText?: string,
    cancelText?: string,
  ): Promise<SweetAlertResult> {
    return fire({
      icon: "question",
      title,
      text,
      showCancelButton: true,
      ...baseTheme,
      confirmButtonText: confirmText ?? tr("common:actions.confirm", "Confirmar"),
      cancelButtonText: cancelText ?? tr("common:actions.cancel", "Cancelar"),
    });
  },

  loading(title?: string, text?: string): void {
    if (Swal.isVisible()) {
      Swal.close();
    }
    Swal.fire({
      title: title ?? tr("common:states.processing", "Processando..."),
      text,
      heightAuto: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });
  },

  close(): void {
    Swal.close();
  },
};

export default alerts;
