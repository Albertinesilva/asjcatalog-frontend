import Swal, { type SweetAlertResult } from "sweetalert2";

/**
 * Wrapper centralizado de SweetAlert2.
 * Nenhuma página deve importar `sweetalert2` diretamente —
 * sempre utilize os helpers deste arquivo.
 */

const baseTheme = {
  confirmButtonColor: "#2986CC",
  cancelButtonColor: "#9E9E9E",
};

export const alerts = {
  success(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: "success",
      title,
      text,
      ...baseTheme,
      confirmButtonText: "OK",
    });
  },

  error(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: "error",
      title,
      text,
      ...baseTheme,
      confirmButtonText: "OK",
    });
  },

  warning(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: "warning",
      title,
      text,
      ...baseTheme,
      confirmButtonText: "OK",
    });
  },

  info(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
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
    return Swal.fire({
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
    Swal.fire({
      title,
      text,
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