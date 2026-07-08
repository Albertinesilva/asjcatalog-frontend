import Swal, { type SweetAlertOptions, type SweetAlertResult } from "sweetalert2";

/**
 * Wrapper centralizado de SweetAlert2.
 * Nenhuma página deve importar `sweetalert2` diretamente —
 * sempre utilize os helpers deste arquivo.
 */

const baseTheme = {
  confirmButtonColor: "#2986CC",
  cancelButtonColor: "#9E9E9E",
};

/**
 * Executa Swal.fire garantindo que:
 * - qualquer modal aberto anteriormente seja fechado antes;
 * - a Promise só resolva depois que o `didClose` do SweetAlert2
 *   for disparado (animação de saída concluída + DOM removido);
 * - o `heightAuto` seja desabilitado, evitando scroll lock residual
 *   no <body> após a navegação para outra rota.
 */
async function fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
  if (Swal.isVisible()) {
    Swal.close();
  }
  return new Promise<SweetAlertResult>((resolve) => {
    let result: SweetAlertResult | undefined;
    Swal.fire({
      heightAuto: false,
      ...options,
      didClose: () => {
        options.didClose?.();
        resolve(result ?? ({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult));
      },
    }).then((r) => {
      result = r;
    });
  });
}

export const alerts = {
  success(title: string, text?: string): Promise<SweetAlertResult> {
    return fire({
      icon: "success",
      title,
      text,
      ...baseTheme,
      confirmButtonText: "OK",
    });
  },

  error(title: string, text?: string): Promise<SweetAlertResult> {
    return fire({
      icon: "error",
      title,
      text,
      ...baseTheme,
      confirmButtonText: "OK",
    });
  },

  warning(title: string, text?: string): Promise<SweetAlertResult> {
    return fire({
      icon: "warning",
      title,
      text,
      ...baseTheme,
      confirmButtonText: "OK",
    });
  },

  info(title: string, text?: string): Promise<SweetAlertResult> {
    return fire({
      icon: "info",
      title,
      text,
      ...baseTheme,
      confirmButtonText: "OK",
    });
  },

  confirm(
    title: string,
    text?: string,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
  ): Promise<SweetAlertResult> {
    return fire({
      icon: "question",
      title,
      text,
      showCancelButton: true,
      ...baseTheme,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
  },

  loading(title = "Processando...", text?: string): void {
    if (Swal.isVisible()) {
      Swal.close();
    }
    Swal.fire({
      title,
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
